import { Organization, OrganizationInput } from "@/app/models/org.models";
import { PgStore } from "@/app/store/pgstore";
import { Builder } from "../builder";
import { PoolClient } from "pg";
import { handleError } from "@/utils/errors/faulterr";

export class OrganizationUsecase {
  private pgstore: PgStore;
  private builder: Builder;

  constructor(pgstore: PgStore, builder: Builder) {
    this.pgstore = pgstore;
    this.builder = builder;
  }

  async create(
    tx: PoolClient,
    timeoutMs: number,
    input: OrganizationInput
  ): Promise<Organization> {
    try {
      return await this.builder.org.create(tx, input);
    } catch (error) {
      return handleError(error, "Error creating organization");
    }
  }

  async update(
    tx: PoolClient,
    timeoutMs: number,
    id: string,
    input: OrganizationInput
  ): Promise<Organization | null> {
    try {
      const existingOrg = await this.pgstore.org.getByID(timeoutMs, id);
      if (!existingOrg) {
        return null;
      }

      // Update all fields from input
      const updatedOrg: Organization = {
        ...existingOrg,
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
      };
      await this.pgstore.org.update(tx, updatedOrg);
      return updatedOrg;
    } catch (error) {
      return handleError(error, "Error updating organization");
    }
  }
}
