import { Controller, Param, Delete, Res } from '@nestjs/common';
import * as express from 'express';
import { TodosService } from './todos.service';

@Controller('todo')
export class TodoController {
  constructor(private readonly todosService: TodosService) {}

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: express.Response) {
    await this.todosService.remove(+id);
    return res.redirect('/todos');
  }
}
