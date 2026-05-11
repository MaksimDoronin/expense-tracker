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
  async remove(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    try {
      await this.transactionsService.remove(user.sub, id);
    } catch (err) {
      if (err instanceof TransactionNotFoundError) throw new NotFoundException(err.message);
      throw err;
    }
  }
}
