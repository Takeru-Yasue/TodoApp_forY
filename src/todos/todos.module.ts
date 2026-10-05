import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TodoController } from './todo.controller';
import { Todo } from './entities/todo.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Todo, User]), UsersModule],
  controllers: [TodosController, TodoController],
  providers: [TodosService],
})
export class TodosModule {}
