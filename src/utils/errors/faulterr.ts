import {
  functionLogger,
  logError,
  logSqlError,
  logWarning,
  boldPurple,
} from "@/utils/logger/logx";
import { logger } from "../logger";

enum ErrorType {
  BAD_REQUEST = "BAD_REQUEST_ERROR",
  FORBIDDEN = "FORBIDDEN_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  NOT_ACCEPTABLE = "NOT_ACCEPTABLE_ERROR",
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY_ERROR",
  FAILED_DEPENDENCY = "FAILED_DEPENDENCY_ERROR",
  GATEWAY_TIMEOUT = "GATEWAY_TIMEOUT_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  CUSTOM = "CUSTOM_ERROR",
}

class ErrorResponse extends Error {
  errorType: ErrorType;
  status: number;
  message: string;

  constructor(errorType: ErrorType, status: number, message: string) {
    super(message); // Pass message to Error base class
    this.errorType = errorType;
    this.status = status;
    this.message = message;

    // This is necessary for TypeScript to correctly capture the prototype chain
    Object.setPrototypeOf(this, ErrorResponse.prototype);
  }

  trace(depth: number = 4): void {
    functionLogger(boldPurple, depth);
  }

  toDict(): Record<string, any> {
    /**
     * Converts the error response to a dictionary
     */
    return {
      errorType: this.errorType,
      status: this.status,
      message: this.message,
    };
  }
}

class ErrorFactory {
  static badRequest(err: string): ErrorResponse {
    return ErrorFactory.createError(ErrorType.BAD_REQUEST, 400, err);
  }

  static unauthorized(err: string): ErrorResponse {
    return ErrorFactory.createError(ErrorType.UNAUTHORIZED, 401, err);
  }

  static forbidden(err: string): ErrorResponse {
    return ErrorFactory.createError(ErrorType.FORBIDDEN, 403, err);
  }

  static notFound(err: string, depth: number = 5): ErrorResponse {
    logWarning(`NOT FOUND - ${err}`, depth);
    return new ErrorResponse(ErrorType.NOT_FOUND, 404, err);
  }

  static notAcceptable(err: string): ErrorResponse {
    return ErrorFactory.createError(ErrorType.NOT_ACCEPTABLE, 406, err);
  }

  static unprocessableEntity(err: string): ErrorResponse {
    return ErrorFactory.createError(ErrorType.UNPROCESSABLE_ENTITY, 422, err);
  }

  static failedDependency(err: string): ErrorResponse {
    return ErrorFactory.createError(ErrorType.FAILED_DEPENDENCY, 424, err);
  }

  static internalServer(err: string): ErrorResponse {
    return ErrorFactory.createError(ErrorType.INTERNAL_SERVER_ERROR, 500, err);
  }

  static postgres(err: string): ErrorResponse {
    if (
      err.toLowerCase().includes("not found") ||
      err.toLowerCase().includes("does not exist")
    ) {
      return ErrorFactory.notFound(err, 6);
    }

    logSqlError(err, 5);
    return new ErrorResponse(
      ErrorType.INTERNAL_SERVER_ERROR,
      500,
      "internal server error"
    );
  }

  static gatewayTimeout(err: string): ErrorResponse {
    return ErrorFactory.createError(ErrorType.GATEWAY_TIMEOUT, 504, err);
  }

  private static createError(
    errorType: ErrorType,
    status: number,
    message: string,
    logFunc: (msg: string, depth: number) => void = logError
  ): ErrorResponse {
    logFunc(message, 6);
    return new ErrorResponse(errorType, status, message);
  }
}

/**
 * Standard error handler for logic layer methods
 * Traces and rethrows ErrorResponse instances, wraps other errors in an internal server error
 *
 * @param error The caught error
 * @param context Context information for non-ErrorResponse errors
 * @throws ErrorResponse
 */
export const handleError = (
  error: unknown,
  context = "Internal server error"
): never => {
  if (error instanceof ErrorResponse) {
    error.trace(5);
    throw error;
  }

  // Log the actual error for debugging
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  logger.error(`${context}: ${errorMessage}`, error);

  // Throw standardized internal server error
  throw ErrorFactory.internalServer(context);
};

export { ErrorType, ErrorResponse, ErrorFactory };
