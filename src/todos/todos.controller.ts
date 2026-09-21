import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AuthenticatedGuard } from '../users/guards/authenticated.guard';

@Controller('todos')
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @Render('index')
  async findAll(@Req() req: express.Request) {
    const rawUserId = req.signedCookies?.userId;
    const userId = rawUserId ? parseInt(rawUserId, 10) : undefined;

    let currentUser: User | null = null;
    if (userId && !isNaN(userId)) {
      currentUser = await this.usersService.findById(userId);
    }

    const todos = await this.todosService.findAll(
      currentUser ? currentUser.id : undefined,
    );
    return { todos, currentUser };
  }

  @Post()
  @UseGuards(AuthenticatedGuard)
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const user = (req as any).user as User;
    await this.todosService.create(createTodoDto, user.id);
    return res.redirect('/todos');
  }
}
