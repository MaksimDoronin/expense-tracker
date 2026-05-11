import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTransactionCommand } from './commands/create-transaction.command';
import { DeleteTransactionCommand } from './commands/delete-transaction.command';
import { UpdateTransactionCommand } from './commands/update-transaction.command';
import { PublicTransaction, TransactionSummary } from './domain/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions.query.dto';
import { SummaryQueryDto } from './dto/summary.query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GetTransactionByIdQuery } from './queries/get-transaction-by-id.query';
import { GetTransactionsSummaryQuery } from './queries/get-transactions-summary.query';
import { ListTransactionsQuery } from './queries/list-transactions.query';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Создаёт новую транзакцию.
   *
   * @param userId - UUID аутентифицированного пользователя.
   * @param dto - Данные новой транзакции.
   * @returns Созданная транзакция.
   * @throws {OwnerNotFoundError} Если пользователь не найден.
   * @throws {CategoryNotFoundForTransactionError} Если категория не принадлежит пользователю.
   */
  create(userId: string, dto: CreateTransactionDto): Promise<PublicTransaction> {
    return this.commandBus.execute(
      new CreateTransactionCommand(
        userId,
        dto.amount,
        dto.type,
        dto.date,
        dto.categoryId,
        dto.description,
      ),
    );
  }

  /**
   * Возвращает список транзакций пользователя с опциональной фильтрацией.
   *
   * @param userId - UUID аутентифицированного пользователя.
   * @param query - Параметры фильтрации (диапазон дат, тип, категория).
   * @returns Массив транзакций, отсортированный по дате по убыванию.
   */
  findAll(userId: string, query: ListTransactionsQueryDto): Promise<PublicTransaction[]> {
    return this.queryBus.execute(
      new ListTransactionsQuery(
        userId,
        query.dateFrom,
        query.dateTo,
        query.type,
        query.categoryId,
      ),
    );
  }

  /**
   * Возвращает агрегированную сводку за месяц.
   *
   * @param userId - UUID аутентифицированного пользователя.
   * @param query - Месяц и год.
   * @returns `TransactionSummary` с итогами доходов, расходов и балансом.
   */
  getSummary(userId: string, query: SummaryQueryDto): Promise<TransactionSummary> {
    return this.queryBus.execute(
      new GetTransactionsSummaryQuery(userId, query.month, query.year),
    );
  }

  /**
   * Возвращает транзакцию по ID.
   *
   * @param userId - UUID аутентифицированного пользователя.
   * @param id - UUID транзакции.
   * @returns Найденная транзакция.
   * @throws {TransactionNotFoundError} Если транзакция не найдена или принадлежит другому пользователю.
   */
  findOne(userId: string, id: string): Promise<PublicTransaction> {
    return this.queryBus.execute(new GetTransactionByIdQuery(id, userId));
  }

  /**
   * Частично обновляет транзакцию.
   *
   * @param userId - UUID аутентифицированного пользователя.
   * @param id - UUID обновляемой транзакции.
   * @param dto - Поля для обновления; переданные поля перезаписываются, остальные не меняются.
   * @returns Обновлённая транзакция.
   * @throws {TransactionNotFoundError} Если транзакция не найдена или не принадлежит пользователю.
   * @throws {CategoryNotFoundForTransactionError} Если новая категория не принадлежит пользователю.
   */
  update(userId: string, id: string, dto: UpdateTransactionDto): Promise<PublicTransaction> {
    const d = dto as CreateTransactionDto;
    return this.commandBus.execute(
      new UpdateTransactionCommand(id, userId, d.amount, d.type, d.date, d.categoryId, d.description),
    );
  }

  /**
   * Удаляет транзакцию.
   *
   * @param userId - UUID аутентифицированного пользователя.
   * @param id - UUID удаляемой транзакции.
   * @returns `void`
   * @throws {TransactionNotFoundError} Если транзакция не найдена или не принадлежит пользователю.
   */
  remove(userId: string, id: string): Promise<void> {
    return this.commandBus.execute(new DeleteTransactionCommand(id, userId));
  }
}
