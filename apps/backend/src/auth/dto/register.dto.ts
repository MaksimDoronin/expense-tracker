import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

/** DTO для регистрации нового пользователя. */
export class RegisterDto {
  @ApiProperty({ description: 'Имя пользователя', example: 'Иван Иванов', minLength: 1, maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ description: 'Email пользователя (уникальный)', example: 'user@example.com' })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ description: 'Пароль (минимум 8 символов)', example: 'P@ssw0rd!', minLength: 8, maxLength: 128 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
