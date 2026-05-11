import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

/** Query-параметры для получения ежемесячной сводки транзакций. */
export class SummaryQueryDto {
  @ApiProperty({ description: 'Номер месяца', minimum: 1, maximum: 12, example: 5 })
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month!: number;

  @ApiProperty({ description: 'Год', minimum: 1970, maximum: 2100, example: 2026 })
  @IsInt()
  @Min(1970)
  @Max(2100)
  @Type(() => Number)
  year!: number;
}
