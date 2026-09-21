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

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('register')
  @Render('register')
  showRegisterPage() {
    return { error: null, success: null, values: {} };
  }

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res() res: express.Response,
  ) {
    try {
      await this.usersService.create(createUserDto);
      // 登録成功後はTodo一覧へリダイレクト
      return res.redirect('/todos');
    } catch (error: any) {
      const message =
        error?.response?.message ||
        error?.message ||
        'ユーザー登録に失敗しました。';
      return res.status(HttpStatus.BAD_REQUEST).render('register', {
        error: Array.isArray(message) ? message.join('、') : message,
        success: null,
        values: {
          email: createUserDto.email || '',
          username: createUserDto.username || '',
        },
      });
    }
  }
}
