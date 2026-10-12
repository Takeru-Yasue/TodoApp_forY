import {
  Controller,
  Param,
  Delete,
  Post,
  Res,
  UseGuards,
  Body,
} from "@nestjs/common";
import * as express from "express";
import { TodosService } from "./todos.service";
import { AuthenticatedGuard } from "../users/guards/authenticated.guard";
import { User } from "../users/entities/user.entity";
import { CurrentUser } from "src/users/decorators/current-user.decorator";
import { UpdateTodoDto } from "./dto/update-todo.dto";

@Controller("todo")
export class TodoController {
  constructor(private readonly todosService: TodosService) {}

  @Delete(":id")
  @UseGuards(AuthenticatedGuard)
  async remove(
    @Param("id") id: string,
    @Res() res: express.Response,
    @CurrentUser() currentUser: User,
  ) {
    await this.todosService.remove(+id, currentUser.id);
    res.redirect("/todos");
  }

  @Post(":id")
  @UseGuards(AuthenticatedGuard)
  async update(
    @Param("id") id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Res() res: express.Response,
    @CurrentUser() currentUser: User,
  ) {
    await this.todosService.update(+id, updateTodoDto, currentUser.id);
    res.redirect("/todos");
  }
}
