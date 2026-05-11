import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

/** Query-параметры для получения ежемесячной сводки транзакций. */
export class SummaryQueryDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month!: number;

  @IsInt()
  @Min(1970)
  @Max(2100)
  @Type(() => Number)
  year!: number;
}
