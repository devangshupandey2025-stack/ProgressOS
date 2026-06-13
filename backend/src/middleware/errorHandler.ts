import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';

/**
 * Global Error Handler Middleware
 *
 * Catches all errors thrown in routes/services and returns a
 * consistent JSON error response. Distinguishes between
 * operational errors (expected) and programming errors (unexpected).
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error for observability
  if (err instanceof AppError) {
    if (!err.isOperational) {
      console.error('💥 UNEXPECTED ERROR:', err);
    } else {
      console.error(`⚠️  ${err.statusCode} — ${err.message}`);
    }
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Prisma known errors
  if (err.name === 'PrismaClientKnownRequestError') {
    console.error('🗄️  Prisma Error:', err.message);
    sendError(res, 'A database error occurred', 500);
    return;
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    console.error('📋 Validation Error:', err.message);
    sendError(res, 'Validation failed', 400);
    return;
  }

  // Unknown / unexpected error
  console.error('💥 UNHANDLED ERROR:', err);
  sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    500
  );
}
