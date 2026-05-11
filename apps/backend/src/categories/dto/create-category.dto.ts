import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** DTO для создания категории. Поля аннотированы `@ApiProperty` для Swagger и декораторами `class-validator`. */
export class CreateCategoryDto {
  @ApiProperty({ description: 'Название категории', example: 'Продукты', minLength: 1, maxLength: 60 })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ description: 'Цвет категории в формате hex', example: '#4ade80', pattern: '^#[0-9a-fA-F]{6}$' })
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color must be a valid hex color (e.g. #ff0000)' })
  color!: string;

  @ApiProperty({ description: 'Идентификатор иконки', example: 'shopping-cart', minLength: 1, maxLength: 40 })
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  icon!: string;
}
