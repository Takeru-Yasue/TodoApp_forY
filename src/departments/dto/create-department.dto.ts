import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: '部署名は必須です' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
