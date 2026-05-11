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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAccessPayload } from '../auth/strategies/jwt.strategy';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryNameTakenError, CategoryNotFoundError, OwnerNotFoundError } from './domain/errors';

/** REST-контроллер для управления категориями расходов. Все маршруты защищены JWT-аутентификацией. */
@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * @param user - JWT-payload аутентифицированного пользователя.
   * @param dto - Название, цвет и иконка новой категории.
   * @returns Созданная категория (`PublicCategory`). HTTP-статусы — см. `@ApiResponse`.
   */
  @Post()
  @ApiOperation({ summary: 'Создать категорию' })
  @ApiResponse({ status: 201, description: 'Категория создана.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Пользователь не аутентифицирован или не найден.' })
  @ApiResponse({ status: 409, description: 'Категория с таким именем уже существует.' })
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

  /**
   * @param user - JWT-payload аутентифицированного пользователя.
   * @returns Массив `PublicCategory[]`, отсортированный по дате создания (ASC). HTTP-статусы — см. `@ApiResponse`.
   */
  @Get()
  @ApiOperation({ summary: 'Список категорий текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Массив категорий, отсортированных по createdAt ASC.' })
  @ApiResponse({ status: 401, description: 'Пользователь не аутентифицирован.' })
  findAll(@CurrentUser() user: JwtAccessPayload) {
    return this.categoriesService.findAllForUser(user.sub);
  }

  /**
   * @param user - JWT-payload аутентифицированного пользователя.
   * @param id - UUID обновляемой категории.
   * @param dto - Поля для обновления; непереданные поля остаются без изменений.
   * @returns Обновлённая категория (`PublicCategory`). HTTP-статусы — см. `@ApiResponse`.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить категорию' })
  @ApiResponse({ status: 200, description: 'Категория обновлена.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Пользователь не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Категория не найдена или не принадлежит пользователю.' })
  @ApiResponse({ status: 409, description: 'Категория с таким именем уже существует.' })
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

  /**
   * @param user - JWT-payload аутентифицированного пользователя.
   * @param id - UUID удаляемой категории.
   * @returns `void`. HTTP-статусы — см. `@ApiResponse`.
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить категорию' })
  @ApiResponse({ status: 204, description: 'Категория удалена.' })
  @ApiResponse({ status: 401, description: 'Пользователь не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Категория не найдена или не принадлежит пользователю.' })
  async remove(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    try {
      await this.categoriesService.remove(user.sub, id);
    } catch (err) {
      if (err instanceof CategoryNotFoundError) throw new NotFoundException(err.message);
      throw err;
    }
  }
}
