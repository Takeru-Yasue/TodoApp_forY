import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  HttpStatus,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import * as express from "express";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import { RegisterValidationFilter } from "./register-validation.filter";
import { DepartmentsService } from "../departments/departments.service";
import { AuthenticatedGuard } from "./guards/authenticated.guard";
import { User } from "./entities/user.entity";
import { CurrentUser } from "./decorator/current-user.decorator";
import { DepartmentIdsDto } from "./dto/departments-ids.dto";

const AUTH_COOKIE_NAME = "userId";
const COOKIE_OPTIONS: express.CookieOptions = {
  httpOnly: true,
  signed: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間有効
  sameSite: "lax",
};

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Get("register")
  @Render("register")
  async showRegisterPage() {
    const departments = await this.departmentsService.findAll();
    return { error: null, values: {}, departments };
  }

  @Post("register")
  @UseFilters(RegisterValidationFilter)
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res() res: express.Response,
  ) {
    try {
      const user = await this.usersService.create(createUserDto);

      if (createUserDto.departmentIds.length > 0) {
        const depts = await this.departmentsService.findByIds(
          createUserDto.departmentIds,
        );
        await this.usersService.setDepartments(user.id, depts);
      }

      res.cookie(AUTH_COOKIE_NAME, String(user.id), COOKIE_OPTIONS);
      res.redirect("/todos");
      return;
    } catch (error) {
      const departments = await this.departmentsService.findAll();
      res.status(HttpStatus.BAD_REQUEST).render("register", {
        error:
          error instanceof Error
            ? error.message
            : "ユーザー登録に失敗しました。",
        values: {
          email: createUserDto.email,
          username: createUserDto.username,
        },
        departments,
      });
      return;
    }
  }

  @Get("login")
  @Render("login")
  showLoginPage(@Body() loginUserDto: LoginUserDto) {
    return {
      error: null,
      values: {
        email: loginUserDto.email || "",
      },
    };
  }

  @Post("login")
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: express.Response,
  ) {
    const user = await this.usersService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED).render("login", {
        error: "メールアドレスまたはパスワードが正しくありません。",
        values: {
          email: loginUserDto.email || "",
        },
      });
      return;
    }

    // ログイン成功: Cookieに署名付きでuserIdを保存
    res.cookie(AUTH_COOKIE_NAME, String(user.id), COOKIE_OPTIONS);
    res.redirect("/todos");
  }

  @Get("logout")
  logout(@Res() res: express.Response) {
    res.clearCookie(AUTH_COOKIE_NAME);
    res.redirect("/login");
  }

  // ---- プロフィールページ ----
  @Get("profile")
  @UseGuards(AuthenticatedGuard)
  @Render("profile")
  async showProfilePage(@CurrentUser() user: User) {
    const userWithDepts = await this.usersService.findByIdWithDepartments(
      user.id,
    );
    const allDepartments = await this.departmentsService.findAll();
    const userDeptIds = (userWithDepts?.departments ?? []).map((d) => d.id);
    return {
      currentUser: user,
      userDeptIds,
      allDepartments,
      success: null,
      error: null,
    };
  }

  @Post("profile")
  @UseGuards(AuthenticatedGuard)
  async updateProfile(
    @Body() dto: DepartmentIdsDto,
    @CurrentUser() user: User,
    @Res() res: express.Response,
  ) {
    const depts = await this.departmentsService.findByIds(dto.departmentIds);
    await this.usersService.setDepartments(user.id, depts);

    const allDepartments = await this.departmentsService.findAll();
    const userDeptIds = depts.map((d) => d.id);
    res.render("profile", {
      currentUser: user,
      userDeptIds,
      allDepartments,
      success: "所属部署を更新しました。",
      error: null,
    });
  }
}
