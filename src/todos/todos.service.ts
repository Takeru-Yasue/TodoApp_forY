import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTodoDto: CreateTodoDto, userId?: number) {
    try {
      let dueDate: Date;
      if (createTodoDto['date'] && createTodoDto['time']) {
        dueDate = new Date(`${createTodoDto['date']} ${createTodoDto['time']}`);
      } else {
        dueDate = new Date();
      }

      const inputPeriod = String(createTodoDto.period || '')
        .trim()
        .toLowerCase();
      let finalPeriod = '';

      if (inputPeriod === 'auto') {
        finalPeriod = this.calculatePeriod(dueDate);
      } else if (inputPeriod === 'none' || inputPeriod === '') {
        finalPeriod = '';
      } else {
        finalPeriod = createTodoDto.period || ''; // 元の文字列（漢字など）を維持
      }

      const deptId = createTodoDto.departmentId
        ? Number(createTodoDto.departmentId)
        : null;

      const todo = this.todoRepository.create({
        title: createTodoDto.title,
        dueDate: dueDate,
        period: finalPeriod,
        userId: userId ?? undefined,
        departmentId: deptId && !isNaN(deptId) ? deptId : null,
      });

      return await this.todoRepository.save(todo);
    } catch (error) {
      console.error('Error creating todo:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(errorMessage);
    }
  }

  private calculatePeriod(date: Date): string {
    const day = date.getDay(); // 0:日, 1:月, 2:火, 3:水, 4:木, 5:金, 6:土
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // 共通スケジュール (~ 14:55)
    if (totalMinutes <= 8 * 60 + 15) return '朝';
    if (totalMinutes <= 9 * 60 + 15) return '1';
    if (totalMinutes <= 10 * 60 + 15) return '2';
    if (totalMinutes <= 11 * 60 + 15) return '3';
    if (totalMinutes <= 12 * 60 + 15) return '4';
    if (totalMinutes <= 13 * 60 + 5) return '昼';
    if (totalMinutes <= 13 * 60 + 55) return '5';
    if (totalMinutes <= 14 * 60 + 55) return '6';

    // 曜日別スケジュール (14:55以降)
    const isSpecialDay = day === 2 || day === 4 || day === 5; // 火, 木, 金

    if (isSpecialDay) {
      // 火, 木, 金: 15:05 ~ 15:55 (7), 15:55 ~ 放課後
      if (totalMinutes <= 15 * 60 + 55) return '7';
      return '放課後';
    } else {
      // 月, 水, 土, 日: 14:55 ~ 放課後
      return '放課後';
    }
  }

  async findAll(userId?: number) {
    try {
      let whereConditions: any = undefined;

      if (userId !== undefined) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['departments'],
        });

        const deptIds = (user?.departments ?? []).map((d) => d.id);

        if (deptIds.length > 0) {
          // 自分の個人のTodo OR 自分が所属する部署のTodo
          whereConditions = [
            { userId },
            { departmentId: In(deptIds) },
          ];
        } else {
          whereConditions = { userId };
        }
      }

      return await this.todoRepository.find({
        where: whereConditions,
        relations: ['user', 'department'],
        order: {
          dueDate: 'ASC',
          period: 'ASC',
        },
      });
    } catch (error) {
      console.error('Error fetching todos:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async findOne(id: number) {
    return await this.todoRepository.findOne({
      where: { id },
      relations: ['user', 'department'],
    });
  }

  async update(id: number, updateTodoDto: UpdateTodoDto) {
    const dueDate = updateTodoDto.dueDate
      ? new Date(updateTodoDto.dueDate)
      : undefined;
    await this.todoRepository.update(id, {
      ...updateTodoDto,
      ...(dueDate && { dueDate }),
    });
    return this.findOne(id);
  }

  async remove(id: number, userId?: number) {
    if (userId) {
      const todo = await this.todoRepository.findOne({ where: { id } });
      if (!todo) return;

      if (todo.userId === userId) {
        return await this.todoRepository.delete(id);
      }

      if (todo.departmentId) {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['departments'],
        });
        const userDeptIds = (user?.departments ?? []).map((d) => d.id);
        if (userDeptIds.includes(todo.departmentId)) {
          return await this.todoRepository.delete(id);
        }
      }
      return;
    }
    return await this.todoRepository.delete(id);
  }
}
