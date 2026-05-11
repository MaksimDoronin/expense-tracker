import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { GetUserByIdQuery } from '../users';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PublicCategory } from './domain/category.entity';
import {
  CategoryNameTakenError,
  CategoryNotFoundError,
  OwnerNotFoundError,
} from './domain/errors';

const categorySelect = {
  id: true,
  name: true,
  color: true,
  icon: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Создаёт категорию для указанного пользователя.
   * Имя категории уникально в рамках одного пользователя (unique constraint `(userId, name)`).
   *
   * @param userId - UUID владельца категории.
   * @param dto - Название, цвет и иконка новой категории.
   * @returns Созданная категория (`PublicCategory`).
   * @throws {OwnerNotFoundError} Если пользователь не найден в БД.
   * @throws {CategoryNameTakenError} Если категория с таким именем уже существует у пользователя.
   */
  async create(userId: string, dto: CreateCategoryDto): Promise<PublicCategory> {
    const user = await this.queryBus.execute(new GetUserByIdQuery(userId));
    if (!user) throw new OwnerNotFoundError();

    try {
      return await this.prisma.category.create({
        data: { name: dto.name, color: dto.color, icon: dto.icon, userId },
        select: categorySelect,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new CategoryNameTakenError();
      }
      throw err;
    }
  }

  /**
   * Возвращает все категории пользователя, отсортированные по дате создания.
   *
   * @param userId - UUID пользователя.
   * @returns Массив `PublicCategory[]`, отсортированный по `createdAt ASC`.
   */
  async findAllForUser(userId: string): Promise<PublicCategory[]> {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: categorySelect,
    });
  }

  /**
   * Частично обновляет категорию. Проверяет принадлежность пользователю перед обновлением.
   *
   * @param userId - UUID владельца; используется для авторизации.
   * @param id - UUID обновляемой категории.
   * @param dto - Поля для обновления; непереданные поля остаются без изменений.
   * @returns Обновлённая категория (`PublicCategory`).
   * @throws {CategoryNotFoundError} Если категория не найдена или не принадлежит пользователю.
   * @throws {CategoryNameTakenError} Если новое имя уже занято у пользователя.
   */
  async update(userId: string, id: string, dto: UpdateCategoryDto): Promise<PublicCategory> {
    const existing = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!existing) throw new CategoryNotFoundError();

    try {
      return await this.prisma.category.update({
        where: { id },
        data: dto,
        select: categorySelect,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new CategoryNameTakenError();
      }
      throw err;
    }
  }

  /**
   * Удаляет категорию. Удаление невозможно, если к категории привязаны транзакции (`Restrict`).
   *
   * @param userId - UUID владельца; используется для авторизации.
   * @param id - UUID удаляемой категории.
   * @returns `void`
   * @throws {CategoryNotFoundError} Если категория не найдена или не принадлежит пользователю.
   */
  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!existing) throw new CategoryNotFoundError();

    await this.prisma.category.delete({ where: { id } });
  }
}
