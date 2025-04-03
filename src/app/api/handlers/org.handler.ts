import { Request, Response } from "express";
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from "@/app/models/org.models";
import { Manager } from "@/app/logic/manager";
import { extractFiltersFromRequest, handleHttpError } from "./handler-utils";

export class OrganizationHandler {
  private manager: Manager;

  constructor(manager: Manager) {
    this.manager = manager;
  }

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = extractFiltersFromRequest(req);
      const result = await this.manager.org.list(filters, req.timeoutMs);
      res.status(200).json(result);
    } catch (error) {
      handleHttpError(res, error, "Error listing organizations");
    }
  };

  getByID = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const obj = await this.manager.org.getByID(id, req.timeoutMs);

      if (!obj) {
        res.status(404).json({ message: "Organization not found" });
        return;
      }

      res.status(200).json(obj);
    } catch (error) {
      handleHttpError(res, error, "Error getting organization");
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const input: CreateOrganizationInput = req.body;
      const obj = await this.manager.org.create(input, req.timeoutMs);
      res.status(201).json(obj);
    } catch (error) {
      handleHttpError(res, error, "Error creating organization");
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const input: UpdateOrganizationInput = {
        id,
        ...req.body,
      };

      const obj = await this.manager.org.update(input, req.timeoutMs);

      if (!obj) {
        res.status(404).json({ message: "Organization not found" });
        return;
      }

      res.status(200).json(obj);
    } catch (error) {
      handleHttpError(res, error, "Error updating organization");
    }
  };

  // static toResponse(organization: Organization): OrganizationResponse {
  //   return {
  //     id: organization.id,
  //     name: organization.name,
  //     description: organization.description,
  //     website: organization.website,
  //     createdAt: organization.createdAt.toISOString(),
  //     updatedAt: organization.updatedAt.toISOString(),
  //   };
  // }

  // static toResponseList(organizations: Organization[]): OrganizationResponse[] {
  //   return organizations.map(this.toResponse);
  // }
}
