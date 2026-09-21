import {
  Controller,
  Param,
  Delete,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as express from 'express';
import { TodosService } from './todos.service';
import { AuthenticatedGuard } from '../users/guards/authenticated.guard';
import { User } from '../users/entities/user.entity';

@Controller('todo')
export class TodoController {
  constructor(private readonly todosService: TodosService) {}

  @Delete(':id')
  @UseGuards(AuthenticatedGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const user = (req as any).user as User;
    await this.todosService.remove(+id, user.id);
    return res.redirect('/todos');
  }
}
