import { UserBuilder } from "./user.builder";
import { OrganizationBuilder } from "./org.builder";
import { PgStore } from "@/app/store/pgstore";

export class Builder {
  public user: UserBuilder;
  public org: OrganizationBuilder;

  constructor(pgstore: PgStore) {
    this.user = new UserBuilder(pgstore);
    this.org = new OrganizationBuilder(pgstore);
  }
}
