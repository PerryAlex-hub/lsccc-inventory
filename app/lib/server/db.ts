import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../../generated/prisma/client";

export type Database = Prisma.TransactionClient;

const globalDatabase = globalThis as unknown as { inventoryPrisma?: PrismaClient };

export function createDatabase(connectionString: string, maxConnections = 3) {
  return new PrismaClient({
    adapter: new PrismaPg(
      {
        connectionString,
        max: maxConnections,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
        statement_timeout: 15000,
      },
      {
        onPoolError: () => console.error("An idle database connection failed."),
        onConnectionError: () => console.error("A database connection failed."),
      },
    ),
    // Handlers report sanitized failures; Prisma must not log query arguments.
    log: [],
  });
}

export function database(): PrismaClient {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  globalDatabase.inventoryPrisma ??= createDatabase(process.env.DATABASE_URL);
  return globalDatabase.inventoryPrisma;
}

export async function transaction<T>(
  work: (db: Database) => Promise<T>,
  client = database(),
): Promise<T> {
  // Serializable transactions reject conflicting stock, token and access changes.
  // Retry the whole operation against a fresh snapshot instead of stale balances.
  for (let attempt = 0; ; attempt++) {
    try {
      return await client.$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10000,
        timeout: 20000,
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2034" ||
        attempt >= 3
      )
        throw error;
    }
  }
}

export async function lockWorkspace(db: Database) {
  // Updating this singleton through Prisma serializes workspace writes without raw SQL.
  await db.workspace.update({ where: { id: 1 }, data: { revision: { increment: 1 } } });
}
