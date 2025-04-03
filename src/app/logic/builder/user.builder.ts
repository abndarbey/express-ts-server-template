import { User, CreateUserInput } from "@/app/models/user.models";
import { PgStore } from "@/app/store/pgstore";

export class UserBuilder {
  private pgstore: PgStore;

  constructor(pgstore: PgStore) {
    this.pgstore = pgstore;
  }

  async create(input: CreateUserInput, timeoutMs: number): Promise<User> {
    return this.pgstore.user.create(input, timeoutMs);
  }
}
