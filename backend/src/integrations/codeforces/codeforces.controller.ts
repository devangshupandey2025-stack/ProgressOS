import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { codeforcesService } from './codeforces.service.js';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/AppError.js';

export class CodeforcesController {
  /**
   * Helper to retrieve codeforcesHandle from the database for a logged-in user.
   */
  private async getHandle(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { codeforcesHandle: true },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (!user.codeforcesHandle) {
      throw AppError.badRequest('Codeforces handle not connected. Please configure your handle in settings.');
    }

    return user.codeforcesHandle;
  }

  /**
   * GET /api/codeforces/profile
   * Returns details about the connected Codeforces profile.
   */
  async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const handle = await this.getHandle(userId);
      const profile = await codeforcesService.getProfile(userId, handle);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/codeforces/rating-history
   * Returns rating changes history for the connected Codeforces profile.
   */
  async getRatingHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const handle = await this.getHandle(userId);
      const history = await codeforcesService.getRatingHistory(userId, handle);
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/codeforces/status
   * Returns whether a Codeforces handle is connected for the user.
   */
  async getStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const status = await codeforcesService.getStatus(userId);
      sendSuccess(res, status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/codeforces/analytics
   * Returns analytics and predictions for the connected Codeforces profile.
   */
  async getAnalytics(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const handle = await this.getHandle(userId);
      const analytics = await codeforcesService.getAnalytics(userId, handle);
      sendSuccess(res, analytics);
    } catch (error) {
      next(error);
    }
  }
}

export const codeforcesController = new CodeforcesController();
