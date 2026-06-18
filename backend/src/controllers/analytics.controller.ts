import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { analyticsService } from '../services/analytics.service.js';
import { sendSuccess } from '../utils/response.js';

export class AnalyticsController {
  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const result = await analyticsService.generate(userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
