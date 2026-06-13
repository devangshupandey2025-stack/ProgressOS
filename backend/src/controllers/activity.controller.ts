import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { activityService } from '../services/activity.service.js';
import { sendSuccess } from '../utils/response.js';

export class ActivityController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const activity = await activityService.create(req.dbUserId!, req.body);
      sendSuccess(res, activity, 201, 'Activity logged');
    } catch (e) { next(e); }
  }

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const activities = await activityService.findAll(req.dbUserId!, limit, offset);
      sendSuccess(res, activities);
    } catch (e) { next(e); }
  }

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const activity = await activityService.findById(req.dbUserId!, id);
      sendSuccess(res, activity);
    } catch (e) { next(e); }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const activity = await activityService.update(req.dbUserId!, id, req.body);
      sendSuccess(res, activity, 200, 'Activity updated');
    } catch (e) { next(e); }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await activityService.delete(req.dbUserId!, id);
      sendSuccess(res, null, 200, 'Activity deleted');
    } catch (e) { next(e); }
  }
}

export const activityController = new ActivityController();
