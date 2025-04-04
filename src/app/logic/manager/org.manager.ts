import {
  Organization,
  OrganizationInput,
  OrganizationListResult,
} from "@/app/models/org.models";
import { PgStore } from "@/app/store/pgstore";
import { Usecase } from "@/app/logic/usecase";
import {
  ErrorFactory,
  ErrorResponse,
  handleError,
} from "@/utils/errors/faulterr";
import { SearchFilter } from "@/app/models/filters";

export class OrganizationManager {
  private pgstore: PgStore;
  private usecase: Usecase;

  constructor(pgstore: PgStore, usecase: Usecase) {
    this.pgstore = pgstore;
    this.usecase = usecase;
  }

  async list(
    timeoutMs: number,
    filter: SearchFilter
  ): Promise<OrganizationListResult> {
    try {
      return await this.pgstore.org.list(timeoutMs, filter);
    } catch (error) {
      return handleError(error, "Error retrieving organization list");
    }
  }

  async getByID(timeoutMs: number, id: string): Promise<Organization | null> {
    try {
      return await this.pgstore.org.getByID(timeoutMs, id);
    } catch (error) {
      return handleError(error, "Error retrieving organization by id");
    }
  }

  async create(
    timeoutMs: number,
    input: OrganizationInput
  ): Promise<Organization> {
    try {
      // Execute database operations within transaction
      const org = await this.pgstore.dbtx.withTx(timeoutMs, async (tx) => {
        return await this.usecase.org.create(tx, timeoutMs, input);
      });

      // Publish event after successful transaction
      // await this.eventService.publishOrganizationUpdated(org);

      return org;
    } catch (error) {
      return handleError(error, "Error creating organization");
    }
  }

  async update(
    timeoutMs: number,
    id: string,
    input: OrganizationInput
  ): Promise<Organization | null> {
    try {
      const org = await this.pgstore.dbtx.withTx(timeoutMs, async (tx) => {
        return await this.usecase.org.update(tx, timeoutMs, id, input);
      });

      return org;
    } catch (error) {
      return handleError(error, "Error updating organization");
    }
  }
}
