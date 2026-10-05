import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../departments/entities/department.entity';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  period: string;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.todos, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  departmentId: number | null;

  @ManyToOne(() => Department, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'departmentId' })
  department: Department | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
