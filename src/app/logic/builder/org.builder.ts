import { Organization, CreateOrganizationInput } from "@/app/models/org.models";
import { PgStore } from "@/app/store/pgstore";

export class OrganizationBuilder {
  private pgstore: PgStore;

  constructor(pgstore: PgStore) {
    this.pgstore = pgstore;
  }

  async create(
    input: CreateOrganizationInput,
    timeoutMs: number
  ): Promise<Organization> {
    return this.pgstore.org.create(input, timeoutMs);
  }
}
