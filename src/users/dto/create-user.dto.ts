import { Transform } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsEmail({}, { message: "有効なメールアドレスを入力してください" })
  @IsNotEmpty({ message: "メールアドレスは必須です" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "パスワードは必須です" })
  @MinLength(6, { message: "パスワードは6文字以上で入力してください" })
  password!: string;

  @IsString()
  @IsOptional()
  username?: string | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === "") return [];
    return (Array.isArray(value) ? value : [value]).map(Number);
  })
  @IsInt({ each: true })
  departmentIds: number[] = [];
}
