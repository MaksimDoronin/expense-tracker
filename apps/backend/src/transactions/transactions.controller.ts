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

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

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

  @Get()
  findAll(
    @CurrentUser() user: JwtAccessPayload,
    @Query() query: ListTransactionsQueryDto,
  ) {
    return this.transactionsService.findAll(user.sub, query);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: JwtAccessPayload, @Query() query: SummaryQueryDto) {
    return this.transactionsService.getSummary(user.sub, query);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtAccessPayload, @Param('id') id: string) {
    try {
      return await this.transactionsService.findOne(user.sub, id);
    } catch (err) {
      if (err instanceof TransactionNotFoundError) throw new NotFoundException(err.message);
      throw err;
    }
  }

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
