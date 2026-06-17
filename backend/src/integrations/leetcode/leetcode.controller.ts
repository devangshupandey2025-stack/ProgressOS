import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { leetCodeService } from './leetcode.service.js';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/AppError.js';

export class LeetCodeController {
  private async getUsername(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { leetcodeUsername: true },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (!user.leetcodeUsername) {
      throw AppError.badRequest('LeetCode username not connected. Configure it in settings.');
    }

    return user.leetcodeUsername;
  }

  async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const status = await leetCodeService.getStatus(userId);
      sendSuccess(res, status);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const username = await this.getUsername(userId);
      const profile = await leetCodeService.getProfile(userId, username);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async getContest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const username = await this.getUsername(userId);
      const contest = await leetCodeService.getContestInfo(userId, username);
      sendSuccess(res, contest);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const username = await this.getUsername(userId);
      const analytics = await leetCodeService.getAnalytics(userId, username);
      sendSuccess(res, analytics);
    } catch (error) {
      next(error);
    }
  }

  async getInsights(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const username = await this.getUsername(userId);
      const insights = await leetCodeService.getInsights(userId, username);
      sendSuccess(res, insights);
    } catch (error) {
      next(error);
    }
  }

  async getReadiness(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const username = await this.getUsername(userId);
      const readiness = await leetCodeService.getReadiness(userId, username);
      sendSuccess(res, readiness);
    } catch (error) {
      next(error);
    }
  }
}

export const leetCodeController = new LeetCodeController();
