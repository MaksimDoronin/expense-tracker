import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAccessPayload } from '../auth/strategies/jwt.strategy';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryNameTakenError, CategoryNotFoundError, OwnerNotFoundError } from './domain/errors';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @CurrentUser() user: JwtAccessPayload,
    @Body() dto: CreateCategoryDto,
  ) {
    try {
      return await this.categoriesService.create(user.sub, dto);
    } catch (err) {
      if (err instanceof OwnerNotFoundError) throw new UnauthorizedException();
      if (err instanceof CategoryNameTakenError) throw new ConflictException(err.message);
      throw err;
    }
  }

  @Get()
  findAll(@CurrentUser() user: JwtAccessPayload) {
    return this.categoriesService.findAllForUser(user.sub);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    try {
      return await this.categoriesService.update(user.sub, id, dto);
    } catch (err) {
      if (err instanceof CategoryNotFoundError) throw new NotFoundException(err.message);
      if (err instanceof CategoryNameTakenError) throw new ConflictException(err.message);
      throw err;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    try {
      await this.categoriesService.remove(user.sub, id);
    } catch (err) {
      if (err instanceof CategoryNotFoundError) throw new NotFoundException(err.message);
      throw err;
    }
  }
}
