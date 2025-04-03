import { Pool, PoolClient } from "pg";
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilter,
} from "@/app/models/user.models";
import { logger } from "@/utils/logger";
import { getDbClient } from "./db-utils";
import { ErrorFactory } from "@/utils/errors/faulterr";

export class UserStore {
  private pool: Pool;
  constructor(pool: Pool) {
    // Either a pool or a client must be provided
    if (!pool) {
      throw new Error(
        "Either pool or client must be provided to OrganizationStore"
      );
    }

    this.pool = pool;
  }

  async list(filter: UserFilter = {}, timeoutMs: number): Promise<User[]> {
    const { client, release } = await getDbClient(this.pool, timeoutMs);

    try {
      let query = `
        SELECT id, email, first_name, last_name, organization_id, created_at, updated_at
        FROM users
        WHERE 1=1
      `;

      const values: any[] = [];
      let paramIndex = 1;

      if (filter.id) {
        query += ` AND id = $${paramIndex++}`;
        values.push(filter.id);
      }

      if (filter.email) {
        query += ` AND email = $${paramIndex++}`;
        values.push(filter.email);
      }

      if (filter.organizationId) {
        query += ` AND organization_id = $${paramIndex++}`;
        values.push(filter.organizationId);
      }

      const result = await client.query(query, values);
      return result.rows.map(this.mapToUser);
    } catch (error) {
      logger.error("Error getting users:", error);
      if (error instanceof Error) {
        throw ErrorFactory.postgres(error.message);
      }
      throw ErrorFactory.internalServer(
        "Unknown error occurred when getting users"
      );
    } finally {
      if (release) {
        client.release();
      }
    }
  }

  async getByID(id: string, timeoutMs: number): Promise<User | null> {
    const users = await this.list({ id }, timeoutMs);
    return users.length > 0 ? users[0] : null;
  }

  async create(input: CreateUserInput, timeoutMs: number): Promise<User> {
    const { client, release } = await getDbClient(this.pool, timeoutMs);

    try {
      const { email, firstName, lastName, password, organizationId } = input;

      const query = `
        INSERT INTO users (email, first_name, last_name, password, organization_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, organization_id, created_at, updated_at
      `;

      const values = [
        email,
        firstName,
        lastName,
        password,
        organizationId || null,
      ];
      const result = await client.query(query, values);

      return this.mapToUser(result.rows[0]);
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    } finally {
      if (release) {
        client.release();
      }
    }
  }

  async update(
    input: UpdateUserInput,
    timeoutMs: number
  ): Promise<User | null> {
    const { client, release } = await getDbClient(this.pool, timeoutMs);

    try {
      const { id, email, firstName, lastName, organizationId } = input;

      // Build dynamic query with only the fields that need to be updated
      let query = `UPDATE users SET updated_at = NOW()`;
      const values: any[] = [];
      let paramIndex = 1;

      if (email) {
        query += `, email = $${paramIndex++}`;
        values.push(email);
      }

      if (firstName) {
        query += `, first_name = $${paramIndex++}`;
        values.push(firstName);
      }

      if (lastName) {
        query += `, last_name = $${paramIndex++}`;
        values.push(lastName);
      }

      if (organizationId !== undefined) {
        query += `, organization_id = $${paramIndex++}`;
        values.push(organizationId || null);
      }

      // Add WHERE clause and RETURNING statement
      query += `
        WHERE id = $${paramIndex}
        RETURNING id, email, first_name, last_name, organization_id, created_at, updated_at
      `;
      values.push(id);

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapToUser(result.rows[0]);
    } catch (error) {
      logger.error("Error updating user:", error);
      throw error;
    } finally {
      if (release) {
        client.release();
      }
    }
  }

  // Helper method to map database row to User domain object
  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      organizationId: row.organization_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
