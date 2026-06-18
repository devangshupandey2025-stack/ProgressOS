import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { timelineService } from '../services/timeline.service.js';
import { sendSuccess } from '../utils/response.js';

export class TimelineController {
  async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const days = parseInt(req.query.days as string) || 30;
      const result = await timelineService.generate(userId, days);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const timelineController = new TimelineController();
