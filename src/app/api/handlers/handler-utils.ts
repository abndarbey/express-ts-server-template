import { Request, Response } from "express";
import { defaultSearchFilter, SearchFilter } from "@/app/models/filters";
import { createSearchFilter } from "@/app/models/filters";
import { UUID } from "crypto";
import { ErrorResponse } from "@/utils/errors/faulterr";
import { logger } from "@/utils/logger";

/**
 * Extracts filter parameters from the request query
 * @param req Express request object
 * @returns SearchFilter object with parameters from request
 */
export const extractFiltersFromRequest = (req: Request): SearchFilter => {
  // Start with default filter values
  const filter = createSearchFilter({
    sortBy: defaultSearchFilter.sortBy,
    sortDir: defaultSearchFilter.sortDir,
    offset: defaultSearchFilter.offset,
    limit: defaultSearchFilter.limit,
  });

  // Extract text search
  if (typeof req.query.text === "string") {
    filter.text = req.query.text;
  }

  // Extract sort parameters
  if (typeof req.query.sortBy === "string") {
    filter.sortBy = req.query.sortBy as SearchFilter["sortBy"];
  }

  if (typeof req.query.sortDir === "string") {
    filter.sortDir = req.query.sortDir as SearchFilter["sortDir"];
  }

  // Extract pagination parameters
  if (typeof req.query.offset === "string") {
    const parsedOffset = parseInt(req.query.offset, 10);
    if (!isNaN(parsedOffset)) {
      filter.offset = parsedOffset;
    }
  }

  if (typeof req.query.limit === "string") {
    const parsedLimit = parseInt(req.query.limit, 10);
    if (!isNaN(parsedLimit)) {
      filter.limit = parsedLimit;
    }
  }

  // Extract boolean flags
  if (req.query.isFinal !== undefined) {
    filter.isFinal = req.query.isFinal === "true";
  }

  if (req.query.isAccepted !== undefined) {
    filter.isAccepted = req.query.isAccepted === "true";
  }

  if (req.query.isApproved !== undefined) {
    filter.isApproved = req.query.isApproved === "true";
  }

  if (req.query.isArchived !== undefined) {
    filter.isArchived = req.query.isArchived === "true";
  }

  // Extract IDs
  if (typeof req.query.orgId === "string") {
    filter.orgId = req.query.orgId as UUID;
  }

  if (typeof req.query.creatorId === "string") {
    filter.creatorId = req.query.creatorId as UUID;
  }

  return filter;
};

/**
 * Standard error handler for API endpoints
 * Handles ErrorResponse instances and generic errors
 *
 * @param res Express response object
 * @param error The caught error
 * @param context Optional context string for logging
 */
export const handleHttpError = (
  res: Response,
  error: unknown,
  context = "API Error"
): void => {
  if (error instanceof ErrorResponse) {
    // Handle known application errors
    error.trace(5);
    res.status(error.status).json({
      message: error.message,
      status: error.status,
      errorType: error.errorType,
    });
  } else {
    // Handle unknown errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`${context}: ${errorMessage}`, error);

    res.status(500).json({
      message: "Internal server error",
      status: 500,
      errorType: "INTERNAL_SERVER_ERROR",
    });
  }
};
