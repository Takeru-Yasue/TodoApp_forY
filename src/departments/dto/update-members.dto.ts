// src/departments/dto/update-members.dto.ts
import { Transform } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

export class UpdateMembersDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === "") return [];
    return (Array.isArray(value) ? value : [value]).map(Number);
  })
  @IsInt({ each: true })
  memberUserIds: number[] = [];
}