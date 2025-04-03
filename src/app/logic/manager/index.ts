import { UserManager } from "./user.manager";
import { OrganizationManager } from "./org.manager";
import { PgStore } from "@/app/store/pgstore";
import { Usecase } from "../usecase";

export class Manager {
  public user: UserManager;
  public org: OrganizationManager;

  constructor(pgstore: PgStore, usecase: Usecase) {
    this.user = new UserManager(pgstore, usecase);
    this.org = new OrganizationManager(pgstore, usecase);
  }
}
