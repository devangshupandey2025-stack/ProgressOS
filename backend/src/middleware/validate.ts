import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * Zod Validation Middleware Factory
 *
 * Returns an Express middleware that validates req.body
 * against the provided Zod schema. On failure, returns
 * a 400 response with human-readable error messages.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod v4 uses .issues instead of .errors
        const messages = error.issues.map(
          (e) => `${e.path.join('.')}: ${e.message}`
        );
        sendError(res, messages.join('; '), 400);
        return;
      }
      next(error);
    }
  };
}
