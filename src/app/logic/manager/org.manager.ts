import {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationFilter,
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
    filter: SearchFilter,
    timeoutMs: number
  ): Promise<OrganizationListResult> {
    try {
      return await this.pgstore.org.list(filter, timeoutMs);
    } catch (error) {
      return handleError(error, "Error retrieving organization list");
    }
  }

  async getByID(id: string, timeoutMs: number): Promise<Organization | null> {
    try {
      return await this.pgstore.org.getByID(id, timeoutMs);
    } catch (error) {
      return handleError(error, "Error retrieving organization by id");
    }
  }

  async create(
    input: CreateOrganizationInput,
    timeoutMs: number
  ): Promise<Organization> {
    try {
      return await this.usecase.org.create(input, timeoutMs);
    } catch (error) {
      return handleError(error, "Error creating organization");
    }
  }

  async update(
    input: UpdateOrganizationInput,
    timeoutMs: number
  ): Promise<Organization | null> {
    try {
      return await this.usecase.org.update(input, timeoutMs);
    } catch (error) {
      return handleError(error, "Error updating organization");
    }
  }
}
