import { UserUsecase } from "./user.usecase";
import { OrganizationUsecase } from "./org.usecase";
import { PgStore } from "@/app/store/pgstore";
import { Builder } from "../builder";

export class Usecase {
  public user: UserUsecase;
  public org: OrganizationUsecase;

  constructor(pgstore: PgStore, builder: Builder) {
    this.user = new UserUsecase(pgstore, builder);
    this.org = new OrganizationUsecase(pgstore, builder);
  }
}
