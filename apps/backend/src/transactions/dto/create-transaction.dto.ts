import { TransactionType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/** DTO для создания транзакции. Поля аннотированы `@ApiProperty` для Swagger и декораторами `class-validator` для глобального `ValidationPipe`. */
export class CreateTransactionDto {
  @ApiProperty({ description: 'Сумма транзакции (положительное, не более 2 знаков после запятой)', example: 1500.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  amount!: number;

  @ApiProperty({ description: 'Тип транзакции', enum: TransactionType, example: TransactionType.expense })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiPropertyOptional({ description: 'Описание транзакции (до 500 символов)', example: 'Продукты в магазине' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Дата транзакции в формате ISO 8601', example: '2026-05-11' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'UUID категории, принадлежащей текущему пользователю', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  categoryId!: string;
}
