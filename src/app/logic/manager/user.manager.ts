import {
  User,
  CreateUserInput,
  UpdateUserInput,
  UserFilter,
} from "@/app/models/user.models";
import { PgStore } from "@/app/store/pgstore";
import { Usecase } from "../usecase";
import { ErrorFactory, ErrorResponse } from "@/utils/errors/faulterr";

export class UserManager {
  private pgstore: PgStore;
  private usecase: Usecase;

  constructor(pgstore: PgStore, usecase: Usecase) {
    this.pgstore = pgstore;
    this.usecase = usecase;
  }

  async list(filter: UserFilter = {}, timeoutMs: number): Promise<User[]> {
    try {
      return await this.pgstore.user.list(filter, timeoutMs);
    } catch (error) {
      if (error instanceof ErrorResponse) {
        error.trace();
        throw error;
      }
      throw ErrorFactory.internalServer("internal server error");
    }
  }

  async getByID(id: string, timeoutMs: number): Promise<User | null> {
    return this.pgstore.user.getByID(id, timeoutMs);
  }

  async create(input: CreateUserInput, timeoutMs: number): Promise<User> {
    return this.usecase.user.create(input, timeoutMs);
  }

  async update(
    input: UpdateUserInput,
    timeoutMs: number
  ): Promise<User | null> {
    return this.usecase.user.update(input, timeoutMs);
  }
}
