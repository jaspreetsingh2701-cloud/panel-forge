import { HealthController } from './health.controller';
import { PrismaService } from '../database/prisma.service';

describe('HealthController', () => {
  it('reports healthy only after the database query succeeds', async () => {
    const queryRaw = jest.fn().mockResolvedValue([{ result: 1 }]);
    const controller = new HealthController({ $queryRaw: queryRaw } as unknown as PrismaService);
    const result = await controller.getHealth();
    expect(queryRaw).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.objectContaining({ status: 'ok', service: 'panelforge-api', dependencies: { database: 'ok' } }));
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
  it('propagates database failures instead of reporting a false healthy status', async () => {
    const failure = new Error('database unavailable');
    const controller = new HealthController({ $queryRaw: jest.fn().mockRejectedValue(failure) } as unknown as PrismaService);
    await expect(controller.getHealth()).rejects.toBe(failure);
  });
});
