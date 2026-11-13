import { PrismaService } from '../src/database/prisma.service';

describe('PostgreSQL integration', () => {
  let prisma: PrismaService;
  beforeAll(async () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must point to the disposable CI/test database.');
    prisma = new PrismaService();
    await prisma.$connect();
  });
  afterAll(async () => { await prisma?.$disconnect(); });
  it('executes a real PostgreSQL query through the Prisma adapter', async () => {
    const rows = await prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 AS result`;
    expect(rows).toEqual([{ result: 1 }]);
  });
  it('includes the JSONB page configuration column after migrations', async () => {
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'applications'
        AND column_name = 'page_config'
    `;
    expect(columns).toEqual([{ column_name: 'page_config' }]);
  });

});
