import { Pool } from "pg";
import dotenv from "dotenv";
import { logger } from "@/utils/logger";

// Interface for database configuration
interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;
  statementTimeoutMillis: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const loadDbConfig = (): DbConfig => {
  // Load environment variables from .env file
  const result = dotenv.config();

  if (result.error) {
    logger.warn("Error loading .env file. Using environment variables only.");
  }

  // Required environment variables
  const requiredVars = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
  ];

  // Check if all required variables are present
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    const errorMsg = `Missing required environment variables: ${missingVars.join(
      ", "
    )}`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Parse DB_PORT as number
  const portStr = process.env.DB_PORT!;
  const port = parseInt(portStr, 10);

  if (isNaN(port)) {
    const errorMsg = `Invalid DB_PORT: "${portStr}" is not a valid number`;
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Create and return the config object
  return {
    host: process.env.DB_HOST!,
    port: port,
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    max: 20,
    statementTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
};

export const connectPostgres = async (): Promise<Pool> => {
  try {
    const dbConfig = loadDbConfig();

    // Create a new connection pool with validated config
    const pool = new Pool(dbConfig);

    // Test the connection
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();

    logger.info("PostgreSQL connected successfully");
    return pool;
  } catch (error) {
    logger.error("PostgreSQL connection error:", error);
    throw error;
  }
};
