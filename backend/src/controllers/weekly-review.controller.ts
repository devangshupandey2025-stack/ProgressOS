import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { weeklyReviewService } from '../services/weekly-review.service.js';
import { sendSuccess } from '../utils/response.js';

export class WeeklyReviewController {
  async getWeeklyReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const result = await weeklyReviewService.generate(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const weeklyReviewController = new WeeklyReviewController();
