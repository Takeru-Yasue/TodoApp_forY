import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  Req,
  UseGuards,
} from "@nestjs/common";
import * as express from "express";
import { TodosService } from "./todos.service";
import { CreateTodoDto } from "./dto/create-todo.dto";
import { UsersService } from "../users/users.service";
import { User } from "../users/entities/user.entity";
import { AuthenticatedGuard } from "../users/guards/authenticated.guard";
import { CurrentUser } from "../users/decorators/current-user.decorator";

@Controller("todos")
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @Render("index")
  async findAll(@Req() req: express.Request) {
    const rawUserId: unknown = req.signedCookies.userId;
    const userId =
      typeof rawUserId === "string" ? parseInt(rawUserId, 10) : NaN;

    const currentUser = isNaN(userId)
      ? null
      : await this.usersService.findByIdWithDepartments(userId);

    const todos = await this.todosService.findAll(currentUser?.id);
    return { todos, currentUser };
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Res() res: express.Response,
    @CurrentUser() user: User,
  ) {
    await this.todosService.create(createTodoDto, user.id);
    res.redirect("/todos");
  }
}
