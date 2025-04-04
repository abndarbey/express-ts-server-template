import { Pool } from "pg";
import { UserStore } from "./user.store";
import { OrganizationStore } from "./org.store";
import { DBTXStore } from "./dbtx.store";

export class PgStore {
  public dbtx: DBTXStore;
  public user: UserStore;
  public org: OrganizationStore;

  constructor(pool: Pool) {
    // Initialize stores with the database pool
    this.dbtx = new DBTXStore(pool);
    this.user = new UserStore(pool);
    this.org = new OrganizationStore(pool);
  }
}
