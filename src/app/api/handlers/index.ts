import { Manager } from "@/app/logic/manager";
import { UserHandler } from "./user.handler";
import { OrganizationHandler } from "./org.handler";

export class Handler {
  public user: UserHandler;
  public org: OrganizationHandler;

  constructor(manager: Manager) {
    // Initialize handlers with their dependencies
    this.user = new UserHandler(manager);
    this.org = new OrganizationHandler(manager);
  }
}
