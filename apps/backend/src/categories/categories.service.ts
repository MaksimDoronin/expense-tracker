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

  async findAllForUser(userId: string): Promise<PublicCategory[]> {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: categorySelect,
    });
  }

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

  async remove(userId: string, id: string): Promise<void> {
    const existing = await this.prisma.category.findFirst({ where: { id, userId } });
    if (!existing) throw new CategoryNotFoundError();

    await this.prisma.category.delete({ where: { id } });
  }
}
