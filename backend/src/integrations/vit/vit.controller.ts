import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { vitService } from './vit.service.js';
import { sendSuccess } from '../../utils/response.js';

export class VitController {
  async getStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const status = await vitService.getStatus(userId);
      sendSuccess(res, status);
    } catch (error) { next(error); }
  }

  async connect(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const { username, password } = req.body;
      const result = await vitService.connect(userId, username, password);
      sendSuccess(res, result);
    } catch (error) { next(error); }
  }

  async disconnect(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      await vitService.disconnect(userId);
      sendSuccess(res, { connected: false });
    } catch (error) { next(error); }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const profile = await vitService.getProfile(userId);
      sendSuccess(res, profile);
    } catch (error) { next(error); }
  }

  async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const analytics = await vitService.getAnalytics(userId);
      sendSuccess(res, analytics);
    } catch (error) { next(error); }
  }

  async getCourses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.dbUserId!;
      const courses = await vitService.getCourses(userId);
      sendSuccess(res, courses);
    } catch (error) { next(error); }
  }
}

export const vitController = new VitController();
