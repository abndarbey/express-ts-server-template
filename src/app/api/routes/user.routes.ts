import { Express, Router } from "express";
import { UserHandler } from "../handlers/user.handler";

export const userRoutes = (
  app: Express,
  apiPath: string,
  h: UserHandler
): void => {
  // Create a router for user routes
  const userRouter = Router();

  // Define routes on the router
  userRouter.get("/", h.list);
  userRouter.get("/:id", h.getByID);
  userRouter.post("/", h.create);
  userRouter.patch("/:id", h.update);

  // Mount the router on the main app
  app.use(`${apiPath}/users`, userRouter);
};
