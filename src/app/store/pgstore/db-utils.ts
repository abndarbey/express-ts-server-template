import { SortByType, SortDirType } from "@/app/models/enums";
import { SearchFilter } from "@/app/models/filters";
import { ErrorFactory } from "@/utils/errors/faulterr";
import { logger } from "@/utils/logger";
import { Pool, PoolClient } from "pg";

/**
 * Gets a database client with the specified timeout duration
 *
 * @param pool - The PostgreSQL connection pool
 * @param timeoutMs - Timeout duration in milliseconds
 * @returns Object containing the client and a release flag
 */
export async function getDbClient(
  pool: Pool,
  timeoutMs: number
): Promise<{ client: PoolClient; release: boolean }> {
  const client = await pool.connect();
  await client.query(`SET statement_timeout TO ${timeoutMs}`);
  return { client, release: true };
}

/**
 * Resolves filter and sort parameters into a SQL ORDER BY clause.
 * @param tableName - Name of the database table
 * @param filter - Search filter parameters
 * @returns Formatted SQL ORDER BY clause with sorting, offset, and limit
 */
export function resolveFilterSort(
  tableName: string,
  filter: SearchFilter
): string {
  const sortMap: Record<SortByType, string> = {
    [SortByType.ALPHABETICAL]: `${tableName}.id`,
    [SortByType.COUNT]: "count",
    [SortByType.DATE_CREATED]: `${tableName}.created_at`,
    [SortByType.DATE_UPDATED]: `${tableName}.updated_at`,
  };

  const orderBy = sortMap[filter.sortBy] || `${tableName}.updated_at`;
  const orderDir = filter.sortDir === SortDirType.ASCENDING ? "ASC" : "DESC";

  return `ORDER BY ${orderBy} ${orderDir} OFFSET ${filter.offset} LIMIT ${filter.limit}`;
}

/**
 * Get total count of records matching the filter criteria.
 * @param client - PostgreSQL client
 * @param qFrom - FROM clause of the SQL query
 * @param qWhere - WHERE clause of the SQL query
 * @param qArgs - Arguments for parameterized query
 * @returns Total count of matching records
 */
export async function getGlobalTotal(
  client: PoolClient,
  qFrom: string,
  qWhere: string,
  qArgs: any[]
): Promise<number> {
  const errMsg = "Error when trying to get total";

  const queryStmt = `SELECT COUNT(*) as total ${qFrom} ${qWhere}`;

  try {
    const result = await client.query(queryStmt, qArgs);
    return result.rows.length > 0 ? parseInt(result.rows[0].total) : 0;
  } catch (error) {
    logger.error(errMsg, error);
    if (error instanceof Error) {
      throw ErrorFactory.postgres(error.message);
    }
    throw ErrorFactory.internalServer(errMsg);
  }
}
