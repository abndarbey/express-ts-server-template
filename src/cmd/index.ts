import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
// import { pinoHttp } from "pino-http";

import { connectPostgres } from "@/config/pgconn.config";
import { logger } from "@/utils/logger";
import { errorHandler } from "@/utils/errors";
import { Handler } from "@/app/api/handlers";
import { initRoutes } from "@/app/api/routes";
import { PgStore } from "@/app/store/pgstore";
import { Manager } from "@/app/logic/manager";
import { Builder } from "@/app/logic/builder";
import { Usecase } from "@/app/logic/usecase";
import { Pool } from "pg";
import { TimeoutDurations } from "@/config/timeout.config";

// configureDependencies sets up and returns the application's dependency instances for the data, business logic, and API layers.
const configureDependencies = (dbPool: Pool) => {
  // Data layer
  const pgstore = new PgStore(dbPool);

  // Business logic layer
  const builder = new Builder(pgstore);
  const usecase = new Usecase(pgstore, builder);
  const manager = new Manager(pgstore, usecase);

  // API layer
  const handler = new Handler(manager);

  return {
    pgstore,
    builder,
    usecase,
    manager,
    handler,
  };
};

function timeoutMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Set the timeout value in the request object
  req.timeoutMs = TimeoutDurations.API;

  // Create a timeout for the request
  const timeoutId: NodeJS.Timeout = setTimeout(() => {
    res.status(503).json({ error: "Request timeout" });
  }, req.timeoutMs);

  // Clear the timeout when the response is sent
  res.on("finish", () => {
    clearTimeout(timeoutId);
  });

  next();
}

const startServer = async () => {
  try {
    // Initialize database connection
    const dbPool = await connectPostgres();
    // logger.info("Database connected successfully");

    const app = express();
    const port = process.env.PORT || 5000;

    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(timeoutMiddleware);
    // app.use(pinoHttp({ logger }));

    // Initialize handlers with dependency injection
    const { handler } = configureDependencies(dbPool);

    // Initialize routes
    initRoutes(app, handler);

    // Global error handler
    app.use(errorHandler);

    // Start server
    app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
