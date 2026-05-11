import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Глобальный сервис для работы с БД через Prisma ORM.
 * Подключается при старте модуля и отключается при завершении — управляет жизненным циклом соединения.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /** Устанавливает соединение с БД при инициализации NestJS-модуля. */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /** Закрывает соединение с БД при уничтожении NestJS-модуля (graceful shutdown). */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
