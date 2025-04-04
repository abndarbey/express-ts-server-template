import { Pool, PoolClient } from "pg";
import { Organization, OrganizationListResult } from "@/app/models/org.models";
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

  ////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////****Read****////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * List retrieves all organizations from database with filtering and pagination
   * @param filter - Search filter parameters for pagination and sorting
   * @param timeoutMs - Timeout duration in milliseconds
   * @returns Organization list with total count
   */
  async list(
    timeoutMs: number,
    filter: SearchFilter
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
  async getByID(timeoutMs: number, id: string): Promise<Organization | null> {
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

  // getByCode
  async getByCode(
    code: number,
    timeoutMs: number
  ): Promise<Organization | null> {
    const { client, release } = await getDbClient(this.pool, timeoutMs);

    const errMsg = `Error when trying to get organization by code: ${code}`;
    try {
      // construct query
      const queryStmt = `
        SELECT * FROM organizations
        WHERE code = $1
        `;

      // query and scan rows
      const result = await client.query(queryStmt, [code]);

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

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////****Mutate****///////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Returns the SQL query for inserting an organization
   * @private
   */
  private insertQuery(): string {
    return `
    INSERT INTO
    organizations(
      id,
      name,
      website,
      pan,
      tan,
      gst,
      cin,
      logo,
      sector,
      status,
      is_final,
      is_archived
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
    `;
  }

  /**
   * Prepares the arguments for the insert query
   * @param organization - The organization to insert
   * @private
   */
  private insertArgs(organization: Organization): any[] {
    return [
      organization.id,
      organization.name,
      organization.website,
      organization.pan,
      organization.tan,
      organization.gst,
      organization.cin,
      organization.logo,
      organization.sector,
      organization.status,
      organization.isFinal,
      organization.isArchived,
    ];
  }

  /**
   * Inserts an organization into the database
   * @param organization - The organization to insert
   * @param tx - The database tx client to use
   * @returns The inserted organization
   */
  async insert(tx: PoolClient, arg: Organization): Promise<Organization> {
    const errMsg = "Error when trying to insert organization";

    try {
      // Query and scan rows
      const result = await tx.query(this.insertQuery(), this.insertArgs(arg));

      if (result.rowCount === 0) {
        throw handlePostgresError(undefined, errMsg);
      }

      return this.mapToOrganization(result.rows[0]);
    } catch (error) {
      throw handlePostgresError(error, errMsg);
    }
  }

  /**
   * Inserts multiple organizations in a single transaction
   * @param tx - The database tx client to use
   * @param organizations - The organizations to insert
   * @returns Promise resolving when the bulk insert is complete
   */
  async bulkInsert(tx: PoolClient, args: Organization[]): Promise<void> {
    const errMsg = "Error inserting bulk organizations";

    try {
      // Execute all inserts using the provided transaction
      for (const arg of args) {
        await tx.query(this.insertQuery(), this.insertArgs(arg));
      }
    } catch (error) {
      throw handlePostgresError(error, errMsg);
    }
  }

  /**
   * Returns the SQL query string for updating an organization
   * @private
   */
  private updateQueryStr(): string {
    return `
    UPDATE organizations
    SET
      name=$1,
      website=$2,
      pan=$3,
      tan=$4,
      gst=$5,
      cin=$6,
      logo=$7,
      sector=$8,
      status=$9,
      is_archived=$10
    WHERE id=$11
    `;
  }

  /**
   * Prepares the arguments for the update query
   * @param organization - The organization to update
   * @private
   */
  private updateArgs(organization: Organization): any[] {
    return [
      organization.name,
      organization.website,
      organization.pan,
      organization.tan,
      organization.gst,
      organization.cin,
      organization.logo,
      organization.sector,
      organization.status,
      organization.isArchived,
      organization.id,
    ];
  }

  /**
   * Updates an organization in the database
   * @param organization - The organization with updated fields
   * @param tx - The database tx client to use
   * @returns Promise that resolves when the update is complete
   */
  async update(tx: PoolClient, organization: Organization): Promise<void> {
    const errMsg = "Error when trying to update organization";

    try {
      // Execute query
      const result = await tx.query(
        this.updateQueryStr(),
        this.updateArgs(organization)
      );

      // Check if any rows were affected
      if (result.rowCount === 0) {
        throw handlePostgresError(undefined, errMsg);
      }
    } catch (error) {
      throw handlePostgresError(error, errMsg);
    }
  }

  /**
   * Updates multiple organizations in a single transaction
   * @param organizations - The organizations to update
   * @param timeoutMs - Timeout duration in milliseconds
   * @returns Promise resolving when all updates are complete
   */
  async bulkUpdate(tx: PoolClient, args: Organization[]): Promise<void> {
    const errMsg = "Error updating bulk organizations";

    try {
      // Execute all updates using the provided transaction
      for (const arg of args) {
        const result = await tx.query(
          this.updateQueryStr(),
          this.updateArgs(arg)
        );

        // Check if the organization exists
        if (result.rowCount === 0) {
          throw handlePostgresError(undefined, errMsg);
        }
      }
    } catch (error) {
      throw handlePostgresError(error, errMsg);
    }
  }

  /**
   * Deletes an organization from the database by ID
   * @param id - The ID of the organization to delete
   * @param client - The database client to use
   * @returns Promise that resolves when the deletion is complete
   */
  async delete(tx: PoolClient, id: string): Promise<void> {
    const errMsg = "Error when trying to delete organization";

    try {
      // Construct query
      const queryStmt = `
      DELETE FROM organizations
      WHERE id = $1`;

      // Execute query
      await tx.query(queryStmt, [id]);
    } catch (error) {
      throw handlePostgresError(error, errMsg);
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////****Helpers****//////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////

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
