import { Express, Router } from "express";
import { OrganizationHandler } from "../handlers/org.handler";

export const organizationRoutes = (
  app: Express,
  apiPath: string,
  h: OrganizationHandler
): void => {
  // Create a router for organization routes
  const orgRouter = Router();

  // Define routes on the router
  orgRouter.get("/", h.list);
  orgRouter.get("/:id", h.getByID);
  orgRouter.post("/", h.create);
  orgRouter.patch("/:id", h.update);

  // Mount the router on the main app
  app.use(`${apiPath}/organizations`, orgRouter);
};
