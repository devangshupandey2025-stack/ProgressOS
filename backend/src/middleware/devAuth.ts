import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';

/**
 * Dev-mode authentication bypass.
 * When NODE_ENV=development and no Authorization header is provided,
 * automatically creates/uses a test user so you can test APIs
 * without setting up Clerk.
 */
const DEV_USER_CLERK_ID = 'dev_test_user_001';
const DEV_USER_EMAIL = 'dev@progressos.local';
const DEV_USER_NAME = 'Dev User';

export async function devAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // If auth header exists, skip dev auth (use real Clerk auth)
    if (req.headers.authorization) {
      return next();
    }

    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return next();
    }

    // Find or create the dev user
    let user = await prisma.user.findUnique({
      where: { clerkId: DEV_USER_CLERK_ID },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: DEV_USER_CLERK_ID,
          email: DEV_USER_EMAIL,
          name: DEV_USER_NAME,
        },
      });
      console.log('🧪 Created dev test user:', user.id);
    }

    (req as AuthenticatedRequest).auth = {
      userId: DEV_USER_CLERK_ID,
      sessionId: 'dev-session',
    };
    (req as AuthenticatedRequest).dbUserId = user.id;

    next();
  } catch (error) {
    next(error);
  }
}
