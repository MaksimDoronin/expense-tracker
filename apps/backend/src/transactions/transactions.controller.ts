import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtAccessPayload } from '../auth/strategies/jwt.strategy';
import {
  CategoryNotFoundForTransactionError,
  OwnerNotFoundError,
  TransactionNotFoundError,
} from './domain/errors';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions.query.dto';
import { SummaryQueryDto } from './dto/summary.query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

/** REST-контроллер для управления транзакциями. Все маршруты защищены JWT-аутентификацией. */
@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * `POST /transactions` — создаёт транзакцию для аутентифицированного пользователя.
   *
   * @param user - JWT-payload аутентифицированного пользователя (`sub` = userId).
   * @param dto - Данные новой транзакции.
   * @returns Созданная транзакция (`PublicTransaction`).
   * @throws {UnauthorizedException} Если пользователь не найден в БД.
   * @throws {NotFoundException} Если категория не существует или не принадлежит пользователю.
   */
  @Post()
  @ApiOperation({ summary: 'Создать транзакцию' })
  @ApiResponse({ status: 201, description: 'Транзакция создана.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Пользователь не аутентифицирован или не найден.' })
  @ApiResponse({ status: 404, description: 'Категория не найдена или не принадлежит пользователю.' })
  async create(@CurrentUser() user: JwtAccessPayload, @Body() dto: CreateTransactionDto) {
    try {
      return await this.transactionsService.create(user.sub, dto);
    } catch (err) {
      if (err instanceof OwnerNotFoundError) throw new UnauthorizedException();
      if (err instanceof CategoryNotFoundForTransactionError)
        throw new NotFoundException(err.message);
      throw err;
    }
  }

  /**
   * `GET /transactions` — возвращает список транзакций с опциональной фильтрацией.
   *
   * @param user - JWT-payload аутентифицированного пользователя.
   * @param query - Параметры фильтрации (dateFrom, dateTo, type, categoryId).
   * @returns Массив `PublicTransaction[]`, отсортированный по дате по убыванию.
   */
  @Get()
  @ApiOperation({ summary: 'Список транзакций с фильтрацией' })
  @ApiResponse({ status: 200, description: 'Массив транзакций, отсортированных по дате (DESC).' })
  @ApiResponse({ status: 401, description: 'Пользователь не аутентифицирован.' })
  findAll(
    @CurrentUser() user: JwtAccessPayload,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.transactionsService.findAll(user.sub, query);
  }

  /**
   * `GET /transactions/summary` — возвращает агрегированную сводку за месяц.
   * Маршрут объявлен до `/:id`, чтобы `summary` не воспринималось как динамический параметр.
   *
   * @param user - JWT-payload аутентифицированного пользователя.
   * @param query - Месяц (1–12) и год.
   * @returns `TransactionSummary` с итогами доходов, расходов и балансом.
   */
  @Get('summary')
  @ApiOperation({ summary: 'Сводка доходов и расходов за месяц' })
  @ApiResponse({ status: 200, description: 'Агрегированная сводка: totalIncome, totalExpense, balance, byCategory.' })
  @ApiResponse({ status: 400, description: 'Невалидные параметры месяца или года.' })
  @ApiResponse({ status: 401, description: 'Пользователь не аутентифицирован.' })
  getSummary(@CurrentUser() user: JwtAccessPayload, @Query() query: SummaryQueryDto) {
    return this.transactionsService.getSummary(user.sub, query);
  }

  /**
   * `GET /transactions/:id` — возвращает одну транзакцию по ID.
   *
   * @param user - JWT-payload аутентифицированного пользователя.
   * @param id - UUID транзакции.
   * @returns Найденная транзакция (`PublicTransaction`).
   * @throws {NotFoundException} Если транзакция не найдена или не принадлежит пользователю.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Получить транзакцию по ID' })
  @ApiResponse({ status: 200, description: 'Транзакция найдена.' })
  @ApiResponse({ status: 401, description: 'Пользователь не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена или не принадлежит пользователю.' })
  async findOne(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    try {
      return await this.transactionsService.findOne(user.sub, id);
    } catch (err) {
      if (err instanceof TransactionNotFoundError) throw new NotFoundException(err.message);
      throw err;
    }
  }

  /**
   * `PATCH /transactions/:id` — частично обновляет транзакцию.
   *
   * @param user - JWT-payload аутентифицированного пользователя.
   * @param id - UUID обновляемой транзакции.
   * @param dto - Поля для обновления; непереданные поля остаются без изменений.
   * @returns Обновлённая транзакция (`PublicTransaction`).
   * @throws {NotFoundException} Если транзакция или новая категория не найдены / не принадлежат пользователю.
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Обновить транзакцию' })
  @ApiResponse({ status: 200, description: 'Транзакция обновлена.' })
  @ApiResponse({ status: 400, description: 'Невалидные данные запроса.' })
  @ApiResponse({ status: 401, description: 'Пользователь не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Транзакция или категория не найдены.' })
  async update(
    @CurrentUser() user: JwtAccessPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    try {
      return await this.transactionsService.update(user.sub, id, dto);
    } catch (err) {
      if (err instanceof TransactionNotFoundError) throw new NotFoundException(err.message);
      if (err instanceof CategoryNotFoundForTransactionError)
        throw new NotFoundException(err.message);
      throw err;
    }
  }

  /**
   * `DELETE /transactions/:id` — удаляет транзакцию. Отвечает HTTP 204 без тела.
   *
   * @param user - JWT-payload аутентифицированного пользователя.
   * @param id - UUID удаляемой транзакции.
   * @returns `void`
   * @throws {NotFoundException} Если транзакция не найдена или не принадлежит пользователю.
   */
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Удалить транзакцию' })
  @ApiResponse({ status: 204, description: 'Транзакция удалена.' })
  @ApiResponse({ status: 401, description: 'Пользователь не аутентифицирован.' })
  @ApiResponse({ status: 404, description: 'Транзакция не найдена или не принадлежит пользователю.' })
  async remove(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    try {
      await this.transactionsService.remove(user.sub, id);
    } catch (err) {
      if (err instanceof TransactionNotFoundError) throw new NotFoundException(err.message);
      throw err;
    }
  }
}
