import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilter,
} from "@/app/models/user.models";
import { PgStore } from "@/app/store/pgstore";
import { Builder } from "../builder";

export class UserUsecase {
  private pgstore: PgStore;
  private builder: Builder;

  constructor(pgstore: PgStore, builder: Builder) {
    this.pgstore = pgstore;
    this.builder = builder;
  }

  async create(input: CreateUserInput, timeoutMs: number): Promise<User> {
    return this.builder.user.create(input, timeoutMs);
  }

  async update(
    input: UpdateUserInput,
    timeoutMs: number
  ): Promise<User | null> {
    return this.pgstore.user.update(input, timeoutMs);
  }
}
