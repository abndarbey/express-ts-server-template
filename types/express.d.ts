import "express";

declare global {
  namespace Express {
    interface Request {
      timeoutMs: number;
    }
  }
}
