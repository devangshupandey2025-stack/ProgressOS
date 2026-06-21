import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { gitHubService } from './github.service.js';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../utils/AppError.js';

export class GitHubController {
  private async getUsername(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubUsername: true },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (!user.githubUsername) {
      throw AppError.badRequest('GitHub username not connected. Configure it in settings.');
    }

    return user.githubUsername;
  }

  async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const status = await gitHubService.getStatus(userId);
      sendSuccess(res, status);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const username = await this.getUsername(userId);
      const profile = await gitHubService.getProfile(userId, username);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async getRepositories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const username = await this.getUsername(userId);
      const repos = await gitHubService.getRepositories(userId, username);
      sendSuccess(res, repos);
    } catch (error) {
      next(error);
    }
  }

  async getActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const username = await this.getUsername(userId);
      const activity = await gitHubService.getActivity(userId, username);
      sendSuccess(res, activity);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const username = await this.getUsername(userId);
      const analytics = await gitHubService.getAnalytics(userId, username);
      sendSuccess(res, analytics);
    } catch (error) {
      next(error);
    }
  }

  async sync(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const result = await gitHubService.sync(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const gitHubController = new GitHubController();
