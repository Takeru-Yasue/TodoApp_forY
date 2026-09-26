import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  /** 全部署一覧（master ユーザー情報付き） */
  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['master'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Department> {
    const dept = await this.departmentRepository.findOne({
      where: { id },
      relations: ['master'],
    });
    if (!dept) {
      throw new NotFoundException(`部署ID ${id} が見つかりません`);
    }
    return dept;
  }

  /** メンバー（所属ユーザー）も含めて取得 */
  async findOneWithMembers(id: number): Promise<Department> {
    const dept = await this.departmentRepository.findOne({
      where: { id },
      relations: ['master', 'users'],
    });
    if (!dept) {
      throw new NotFoundException(`部署ID ${id} が見つかりません`);
    }
    return dept;
  }

  async findByIds(ids: number[]): Promise<Department[]> {
    if (!ids || ids.length === 0) return [];
    return this.departmentRepository.find({ where: { id: In(ids) } });
  }

  /** 部署を作成し、作成者をマスターに設定する */
  async create(dto: CreateDepartmentDto, masterId: number): Promise<Department> {
    const existing = await this.departmentRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException('同名の部署が既に存在します');
    }
    const dept = this.departmentRepository.create({ ...dto, masterId });
    return this.departmentRepository.save(dept);
  }

  /** 部署名・説明を更新（マスターのみ） */
  async update(
    id: number,
    dto: Partial<CreateDepartmentDto>,
    requesterId: number,
  ): Promise<Department> {
    const dept = await this.findOne(id);
    if (dept.masterId !== requesterId) {
      throw new ForbiddenException('この操作はマスターユーザーのみ行えます');
    }
    if (dto.name && dto.name !== dept.name) {
      const existing = await this.departmentRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) throw new ConflictException('同名の部署が既に存在します');
    }
    Object.assign(dept, dto);
    return this.departmentRepository.save(dept);
  }

  /** マスターユーザーを変更（現マスターのみ） */
  async updateMaster(
    id: number,
    newMasterId: number,
    requesterId: number,
  ): Promise<Department> {
    const dept = await this.findOne(id);
    if (dept.masterId !== requesterId) {
      throw new ForbiddenException('この操作はマスターユーザーのみ行えます');
    }
    dept.masterId = newMasterId;
    return this.departmentRepository.save(dept);
  }

  /** 部署を削除（マスターのみ） */
  async remove(id: number, requesterId: number): Promise<void> {
    const dept = await this.findOne(id);
    if (dept.masterId !== requesterId) {
      throw new ForbiddenException('この操作はマスターユーザーのみ行えます');
    }
    await this.departmentRepository.delete(id);
  }
}

