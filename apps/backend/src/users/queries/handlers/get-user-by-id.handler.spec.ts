import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublicUser } from '../../domain/user.entity';
import { GetUserByIdQuery } from '../get-user-by-id.query';
import { GetUserByIdHandler } from './get-user-by-id.handler';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

describe('GetUserByIdHandler', () => {
  let handler: GetUserByIdHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdHandler,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    handler = module.get<GetUserByIdHandler>(GetUserByIdHandler);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('возвращает PublicUser когда пользователь найден', async () => {
      const user: PublicUser = { id: 'uuid-1', name: 'Иван', email: 'ivan@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await handler.execute(new GetUserByIdQuery('uuid-1'));

      expect(result).toEqual(user);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        select: { id: true, name: true, email: true },
      });
    });

    it('возвращает null когда пользователь не найден', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await handler.execute(new GetUserByIdQuery('nonexistent-id'));

      expect(result).toBeNull();
    });

    it('не включает passwordHash в выборку', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await handler.execute(new GetUserByIdQuery('uuid-1'));

      const call = mockPrismaService.user.findUnique.mock.calls[0][0] as {
        select: Record<string, boolean>;
      };
      expect(call.select).not.toHaveProperty('passwordHash');
    });

    it('пробрасывает ошибку базы данных', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(new Error('DB connection failed'));

      await expect(handler.execute(new GetUserByIdQuery('uuid-1'))).rejects.toThrow(
        'DB connection failed',
      );
    });
  });
});
