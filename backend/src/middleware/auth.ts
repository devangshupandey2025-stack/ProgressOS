import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, getAuth } from '@clerk/express';
import { clerkClient } from '@clerk/express';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { AuthenticatedRequest } from '../types/index.js';

/**
 * Clerk Authentication Middleware
 *
 * 1. Uses @clerk/express getAuth() to extract auth state from the request.
 * 2. Looks up (or creates) the internal database user.
 * 3. Attaches auth info and the internal DB user ID to the request.
 *
 * NOTE: clerkMiddleware() must be applied globally on the Express app
 * BEFORE this middleware is used on individual routes.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = getAuth(req);

    if (!auth || !auth.userId) {
      throw AppError.unauthorized('Authentication required');
    }

    const clerkUserId = auth.userId;

    // Find or create the user in our database
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      // First-time login — fetch user details from Clerk and create a record
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      user = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
        },
      });
    }

    // Attach auth info to the request
    (req as AuthenticatedRequest).auth = {
      userId: clerkUserId,
      sessionId: auth.sessionId ?? '',
    };
    (req as AuthenticatedRequest).dbUserId = user.id;

    next();
  } catch (error) {
    next(error);
  }
}

// Re-export clerkMiddleware for use in the main app
export { clerkMiddleware };
