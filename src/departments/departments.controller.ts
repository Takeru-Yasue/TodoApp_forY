import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  Res,
  Render,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import * as express from 'express';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UsersService } from '../users/users.service';
import { AuthenticatedGuard } from '../users/guards/authenticated.guard';
import { User } from '../users/entities/user.entity';

@Controller('departments')
@UseGuards(AuthenticatedGuard)
export class DepartmentsController {
  constructor(
    private readonly departmentsService: DepartmentsService,
    private readonly usersService: UsersService,
  ) {}

  /** 部署一覧ページ */
  @Get()
  @Render('departments/index')
  async index(@Req() req: express.Request) {
    const currentUser = (req as any).user as User;
    const departments = await this.departmentsService.findAll();
    const userWithDepts = await this.usersService.findByIdWithDepartments(currentUser.id);
    const myDeptIds = (userWithDepts?.departments ?? []).map((d) => d.id);
    return { departments, currentUser, myDeptIds, error: null, success: null };
  }

  /** 部署を新規作成（ログイン済みなら誰でも可） */
  @Post()
  async create(
    @Body() dto: CreateDepartmentDto,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const currentUser = (req as any).user as User;
    try {
      await this.departmentsService.create(dto, currentUser.id);
      return res.redirect('/departments');
    } catch (error: any) {
      const departments = await this.departmentsService.findAll();
      const userWithDepts = await this.usersService.findByIdWithDepartments(currentUser.id);
      const myDeptIds = (userWithDepts?.departments ?? []).map((d) => d.id);
      return res.status(HttpStatus.BAD_REQUEST).render('departments/index', {
        departments,
        currentUser,
        myDeptIds,
        error: error?.response?.message || error?.message || '作成に失敗しました',
        success: null,
      });
    }
  }

  /** 部署を削除（マスターのみ） */
  @Post(':id/delete')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const currentUser = (req as any).user as User;
    try {
      await this.departmentsService.remove(id, currentUser.id);
      return res.redirect('/departments');
    } catch (error: any) {
      const departments = await this.departmentsService.findAll();
      const userWithDepts = await this.usersService.findByIdWithDepartments(currentUser.id);
      const myDeptIds = (userWithDepts?.departments ?? []).map((d) => d.id);
      return res.status(HttpStatus.FORBIDDEN).render('departments/index', {
        departments,
        currentUser,
        myDeptIds,
        error: error?.response?.message || error?.message || '削除に失敗しました',
        success: null,
      });
    }
  }

  /** 部署の管理ページ（マスター変更・名前変更） */
  @Get(':id/manage')
  @Render('departments/manage')
  async showManagePage(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: express.Request,
  ) {
    const currentUser = (req as any).user as User;
    const dept = await this.departmentsService.findOne(id);
    const allUsers = await this.usersService.findAll();
    const candidateUsers = allUsers.filter((u) => u.id !== currentUser.id);

    return {
      dept,
      currentUser,
      candidateUsers,
      isMaster: dept.masterId === currentUser.id,
      error: null,
      success: null,
    };
  }

  /** 部署に参加する */
  @Post(':id/join')
  async join(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const currentUser = (req as any).user as User;
    const dept = await this.departmentsService.findOne(id);
    const userWithDepts = await this.usersService.findByIdWithDepartments(currentUser.id);
    if (userWithDepts) {
      const depts = userWithDepts.departments ?? [];
      if (!depts.some((d) => d.id === dept.id)) {
        depts.push(dept);
        await this.usersService.setDepartments(currentUser.id, depts);
      }
    }
    return res.redirect('/departments');
  }

  /** 部署から脱退する */
  @Post(':id/leave')
  async leave(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const currentUser = (req as any).user as User;
    const userWithDepts = await this.usersService.findByIdWithDepartments(currentUser.id);
    if (userWithDepts) {
      const depts = (userWithDepts.departments ?? []).filter((d) => d.id !== id);
      await this.usersService.setDepartments(currentUser.id, depts);
    }
    return res.redirect('/departments');
  }

  /** マスターユーザーを変更（マスターのみ） */
  @Post(':id/master')
  async updateMaster(
    @Param('id', ParseIntPipe) id: number,
    @Body('newMasterId') newMasterIdStr: string,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const currentUser = (req as any).user as User;
    const newMasterId = parseInt(newMasterIdStr, 10);
    if (isNaN(newMasterId)) {
      return res.redirect(`/departments/${id}/manage`);
    }
    try {
      await this.departmentsService.updateMaster(id, newMasterId, currentUser.id);
      return res.redirect('/departments');
    } catch (error: any) {
      const dept = await this.departmentsService.findOne(id);
      const allUsers = await this.usersService.findAll();
      const candidateUsers = allUsers.filter((u) => u.id !== currentUser.id);
      return res.status(HttpStatus.FORBIDDEN).render('departments/manage', {
        dept,
        currentUser,
        candidateUsers,
        isMaster: dept.masterId === currentUser.id,
        error: error?.response?.message || '変更に失敗しました',
        success: null,
      });
    }
  }
}
