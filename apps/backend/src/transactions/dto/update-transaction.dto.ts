import { PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';

/** DTO для обновления транзакции. `PartialType` импортирован из `@nestjs/swagger` — это обязательно для корректного наследования `@ApiProperty`-метаданных в Swagger UI. */
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
