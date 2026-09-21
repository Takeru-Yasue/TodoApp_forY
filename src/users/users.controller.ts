import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  HttpStatus,
} from '@nestjs/common';
import * as express from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

const AUTH_COOKIE_NAME = 'userId';
const COOKIE_OPTIONS: express.CookieOptions = {
  httpOnly: true,
  signed: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7日間有効
  sameSite: 'lax',
};

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('register')
  @Render('register')
  showRegisterPage() {
    return { error: null, values: {} };
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res() res: express.Response,
  ) {
    try {
      const user = await this.usersService.create(createUserDto);
      // 登録成功時に自動ログインCookieを付与
      res.cookie(AUTH_COOKIE_NAME, String(user.id), COOKIE_OPTIONS);
      return res.redirect('/todos');
    } catch (error: any) {
      const message =
        error?.response?.message ||
        error?.message ||
        'ユーザー登録に失敗しました。';
      return res.status(HttpStatus.BAD_REQUEST).render('register', {
        error: Array.isArray(message) ? message.join('、') : message,
        values: {
          email: createUserDto.email || '',
          username: createUserDto.username || '',
        },
      });
    }
  }

  @Get('login')
  @Render('login')
  showLoginPage() {
    return { error: null, values: {} };
  }

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res() res: express.Response,
  ) {
    const user = await this.usersService.validateUser(
      loginUserDto.email,
      loginUserDto.password,
    );

    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).render('login', {
        error: 'メールアドレスまたはパスワードが正しくありません。',
        values: {
          email: loginUserDto.email || '',
        },
      });
    }

    // ログイン成功: Cookieに署名付きでuserIdを保存
    res.cookie(AUTH_COOKIE_NAME, String(user.id), COOKIE_OPTIONS);
    return res.redirect('/todos');
  }

  @Get('logout')
  logout(@Res() res: express.Response) {
    res.clearCookie(AUTH_COOKIE_NAME);
    return res.redirect('/login');
  }
}
