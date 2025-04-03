import { Pool } from "pg";
import {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationListResult,
} from "@/app/models/org.models";
import { logger } from "@/utils/logger";
import { ErrorType, handlePostgresError } from "@/utils/errors/faulterr";
import { getDbClient, getGlobalTotal, resolveFilterSort } from "./db-utils";
import { SearchFilter } from "@/app/models/filters";

export class OrganizationStore {
  private pool: Pool;
  constructor(pool: Pool) {
    if (!pool) {
      throw new Error("Either pool must be provided to OrganizationStore");
    }

    this.pool = pool;
  }

  /**
   * List retrieves all organizations from database with filtering and pagination
   * @param filter - Search filter parameters for pagination and sorting
   * @param timeoutMs - Timeout duration in milliseconds
   * @returns Organization list with total count
   */
  async list(
    filter: SearchFilter,
    timeoutMs: number
  ): Promise<OrganizationListResult> {
    const { client, release } = await getDbClient(this.pool, timeoutMs);
    const errMsg = "Error when trying to get organizations";

    try {
      // Construct query parts
      const qSelect = `SELECT *`;
      const qFrom = `FROM organizations`;
      const qWhere = `
        WHERE ($1::BOOLEAN IS NULL OR $1 = is_archived)
        AND   ($2::TEXT IS NULL OR name ILIKE '%' || $2 || '%')
      `;

      // Make query args
      const qArgs: any[] = [filter.isArchived, filter.text];

      // Get sort and pagination
      const qFilter = resolveFilterSort("organizations", filter);

      // Construct complete query
      const queryStmt = `${qSelect} ${qFrom} ${qWhere} ${qFilter}`;

      // Execute query
      const output = await client.query(queryStmt, qArgs);
      const list = output.rows.map(this.mapToOrganization);

      // Get total count of matching records
      const total = await getGlobalTotal(client, qFrom, qWhere, qArgs);

      return { total, list };
    } catch (error) {
      throw handlePostgresError(error, errMsg);
    } finally {
      if (release) {
        client.release();
      }
    }
  }

  // getByID
  async getByID(id: string, timeoutMs: number): Promise<Organization | null> {
    const { client, release } = await getDbClient(this.pool, timeoutMs);

    const errMsg = `Error when trying to get organization by id: ${id}`;
    try {
      // construct query
      const queryStmt = `
        SELECT * FROM organizations
        WHERE id = $1
        `;

      // query and scan rows
      const result = await client.query(queryStmt, [id]);

      // throw error is row count is zero
      if (result.rowCount === 0) {
        throw new Error(`${ErrorType.NOT_FOUND}${errMsg}`);
      }

      return this.mapToOrganization(result.rows[0]);
    } catch (error) {
      throw handlePostgresError(error, errMsg);
    } finally {
      if (release) {
        client.release();
      }
    }
  }

  // create
  async create(
    input: CreateOrganizationInput,
    timeoutMs: number
  ): Promise<Organization> {
    const { client, release } = await getDbClient(this.pool, timeoutMs);

    try {
      const { name, description, website } = input;

      const query = `
        INSERT INTO organizations (name, description, website)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, website, created_at, updated_at
      `;

      const values = [name, description || null, website || null];
      const result = await client.query(query, values);

      return this.mapToOrganization(result.rows[0]);
    } catch (error) {
      logger.error("Error creating organization:", error);
      throw error;
    } finally {
      if (release) {
        client.release();
      }
    }
  }

  // update
  async update(
    input: UpdateOrganizationInput,
    timeoutMs: number
  ): Promise<Organization | null> {
    const { client, release } = await getDbClient(this.pool, timeoutMs);

    try {
      const { id, name, description, website } = input;

      // Build dynamic query with only the fields that need to be updated
      let query = `UPDATE organizations SET updated_at = NOW()`;
      const values: any[] = [];
      let paramIndex = 1;

      if (name) {
        query += `, name = $${paramIndex++}`;
        values.push(name);
      }

      if (description !== undefined) {
        query += `, description = $${paramIndex++}`;
        values.push(description || null);
      }

      if (website !== undefined) {
        query += `, website = $${paramIndex++}`;
        values.push(website || null);
      }

      // Add WHERE clause and RETURNING statement
      query += `
        WHERE id = $${paramIndex}
        RETURNING id, name, description, website, created_at, updated_at
      `;
      values.push(id);

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToOrganization(result.rows[0]);
    } catch (error) {
      logger.error("Error updating organization:", error);
      throw error;
    } finally {
      if (release) {
        client.release();
      }
    }
  }

  // Helper method to map database row to Organization domain object
  private mapToOrganization(row: any): Organization {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      website: row.website,
      pan: row.pan,
      tan: row.tan,
      gst: row.gst,
      cin: row.cin,
      logo: row.logo,
      sector: row.sector,
      status: row.status,
      isFinal: row.is_final,
      isArchived: row.is_archived,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
