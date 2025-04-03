import {
  Organization,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationFilter,
} from "@/app/models/org.models";
import { PgStore } from "@/app/store/pgstore";
import { Builder } from "../builder";

export class OrganizationUsecase {
  private pgstore: PgStore;
  private builder: Builder;

  constructor(pgstore: PgStore, builder: Builder) {
    this.pgstore = pgstore;
    this.builder = builder;
  }

  async create(
    input: CreateOrganizationInput,
    timeoutMs: number
  ): Promise<Organization> {
    return this.builder.org.create(input, timeoutMs);
  }

  async update(
    input: UpdateOrganizationInput,
    timeoutMs: number
  ): Promise<Organization | null> {
    return this.pgstore.org.update(input, timeoutMs);
  }
}
