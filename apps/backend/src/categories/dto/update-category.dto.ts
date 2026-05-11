import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';

/** DTO для обновления категории. `PartialType` из `@nestjs/swagger` — обязателен для корректного наследования `@ApiProperty`-метаданных в Swagger UI. */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
