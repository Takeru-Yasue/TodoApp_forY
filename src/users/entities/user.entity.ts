import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Todo } from '../../todos/entities/todo.entity';
import { Department } from '../../departments/entities/department.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  username?: string | null;

  @Column()
  password!: string;

  @OneToMany(() => Todo, (todo) => todo.user)
  todos?: Todo[];

  @ManyToMany(() => Department, (department) => department.users, {
    eager: false,
  })
  @JoinTable({
    name: 'user_departments',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'departmentId', referencedColumnName: 'id' },
  })
  departments?: Department[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
