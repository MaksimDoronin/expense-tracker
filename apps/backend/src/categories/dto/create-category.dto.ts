import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'color must be a valid hex color (e.g. #ff0000)' })
  color!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  icon!: string;
}
