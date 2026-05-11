import { TransactionType } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

/** Query-параметры для фильтрации списка транзакций. Все поля необязательны; фильтры применяются по AND. */
export class ListTransactionsQueryDto {
  @ApiPropertyOptional({ description: 'Нижняя граница диапазона дат (ISO 8601, включительно)', example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Верхняя граница диапазона дат (ISO 8601, включительно)', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Фильтр по типу транзакции', enum: TransactionType, example: TransactionType.expense })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({ description: 'UUID категории для фильтрации', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
