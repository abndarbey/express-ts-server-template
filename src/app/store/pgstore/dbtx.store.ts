import { logger } from "@/utils/logger";
import { Pool, PoolClient } from "pg";
import { getDbClient } from "./db-utils";

/**
 * Class for managing database transactions
 */
export class DBTXStore {
  private pool: Pool;

  /**
   * Creates a new DBTXStore instance
   * @param pool - Database connection pool
   */
  constructor(pool: Pool) {
    if (!pool) {
      throw new Error("Pool must be provided to DBTXStore");
    }
    this.pool = pool;
  }

  /**
   * Begins a transaction
   * @param client - Database client
   */
  async beginTx(client: PoolClient): Promise<void> {
    await client.query("BEGIN");
  }

  /**
   * Commits a transaction
   * @param client - Database client
   */
  async commitTx(client: PoolClient): Promise<void> {
    await client.query("COMMIT");
  }

  /**
   * Rolls back a transaction
   * @param client - Database client
   */
  async rollbackTx(client: PoolClient): Promise<void> {
    try {
      await client.query("ROLLBACK");
    } catch (err) {
      logger.error("Error rolling back transaction", err);
    }
  }

  /**
   * Executes a function within a transaction
   * @param timeoutMs - Connection timeout in milliseconds
   * @param fn - Function to execute within transaction
   * @returns Result from the executed function
   */
  async withTx<T>(
    timeoutMs: number,
    fn: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    // Use your existing getDbClient function
    const { client, release } = await getDbClient(this.pool, timeoutMs);

    try {
      await this.beginTx(client);
      const result = await fn(client);
      await this.commitTx(client);
      return result;
    } catch (error) {
      await this.rollbackTx(client);
      throw error;
    } finally {
      if (release) {
        client.release();
      }
    }
  }
}
