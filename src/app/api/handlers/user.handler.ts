import { Request, Response } from "express";
import {
  CreateUserInput,
  UpdateUserInput,
  User,
  UserResponse,
} from "@/app/models/user.models";
import { logger } from "@/utils/logger";
import { Manager } from "@/app/logic/manager";
import { ErrorResponse } from "@/utils/errors/faulterr";

export class UserHandler {
  private manager: Manager;

  constructor(manager: Manager) {
    this.manager = manager;
  }

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = req.query;
      const users = await this.manager.user.list(filters, req.timeoutMs);
      res.status(200).json(UserHandler.toResponseList(users));
    } catch (error) {
      if (error instanceof ErrorResponse) {
        error.trace();
        res.status(error.status).json({
          message: error.message,
          status: error.status,
          errorType: error.errorType,
        });
      } else {
        res.status(500).json({
          message: "Internal server error",
          status: 500,
          errorType: "INTERNAL_SERVER_ERROR",
        });
      }
    }
  };

  getByID = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.manager.user.getByID(id, req.timeoutMs);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(UserHandler.toResponse(user));
    } catch (error) {
      logger.error(`Error getting user with id ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const input: CreateUserInput = req.body;
      const user = await this.manager.user.create(input, req.timeoutMs);
      res.status(201).json(UserHandler.toResponse(user));
    } catch (error) {
      logger.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdateUserInput = {
        id,
        ...req.body,
      };

      const user = await this.manager.user.update(input, req.timeoutMs);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(UserHandler.toResponse(user));
    } catch (error) {
      logger.error(`Error updating user with id ${req.params.id}:`, error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toResponseList(users: User[]): UserResponse[] {
    return users.map(this.toResponse);
  }
}
