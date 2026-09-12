import { Controller, Get, Post, Body, Render, Res } from '@nestjs/common';
import * as express from 'express';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @Render('index')
  async findAll() {
    const todos = await this.todosService.findAll();
    return { todos };
  }

  @Post()
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @Res() res: express.Response,
  ) {
    await this.todosService.create(createTodoDto);
    return res.redirect('/todos');
  }
}
