import { Express } from "express";
import { Handler } from "@/app/api/handlers";
import { userRoutes } from "./user.routes";
import { organizationRoutes } from "./org.routes";

export const initRoutes = (app: Express, h: Handler): void => {
  // Base API path
  const apiPath = "/api/v1";

  // Register routes
  userRoutes(app, apiPath, h.user);
  organizationRoutes(app, apiPath, h.org);

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
  });
};
