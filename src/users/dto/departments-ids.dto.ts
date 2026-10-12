// src/users/dto/department-ids.dto.ts
import { Transform } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

export class DepartmentIdsDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === "") return [];
    return (Array.isArray(value) ? value : [value]).map(Number);
  })
  @IsInt({ each: true })
  departmentIds: number[] = [];
}
