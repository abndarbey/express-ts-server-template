import { generateUUID } from "@/app/models/common";
import { Organization, OrganizationInput } from "@/app/models/org.models";
import { PgStore } from "@/app/store/pgstore";
import { handleError } from "@/utils/errors/faulterr";
import { PoolClient } from "pg";

export class OrganizationBuilder {
  private pgstore: PgStore;

  constructor(pgstore: PgStore) {
    this.pgstore = pgstore;
  }

  async create(
    tx: PoolClient,
    input: OrganizationInput
  ): Promise<Organization> {
    try {
      const org = this.construct(input);
      return this.pgstore.org.insert(tx, org);
    } catch (error) {
      return handleError(error, "Error creating organization");
    }
  }

  private construct(input: OrganizationInput): Organization {
    // Validate name
    if (!input.name || input.name.trim() === "") {
      throw new Error("Organization name is required");
    }

    return {
      id: generateUUID(),

      // Copy all fields from input
      name: input.name,
      website: input.website,
      pan: input.pan,
      tan: input.tan,
      gst: input.gst,
      cin: input.cin,
      logo: input.logo,
      sector: input.sector,
      status: input.status,
      isFinal: input.isFinal,
      isArchived: input.isArchived,
    } as Organization;
  }
}
