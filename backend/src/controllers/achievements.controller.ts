import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { achievementsService } from '../services/achievements.service.js';
import { sendSuccess } from '../utils/response.js';

export class AchievementsController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const result = await achievementsService.getAll(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const achievementsController = new AchievementsController();
