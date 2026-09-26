import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => DepartmentsModule)],
  controllers: [UsersController],
  providers: [UsersService, AuthenticatedGuard],
  exports: [UsersService, AuthenticatedGuard],
})
export class UsersModule {}


