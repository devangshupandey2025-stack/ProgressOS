import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { careerProfileService } from '../../services/career/profile.service.js';
import { sendSuccess } from '../../utils/response.js';

export class ProfileController {
  async get(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await careerProfileService.getProfile(req.dbUserId!);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await careerProfileService.updateProfile(req.dbUserId!, req.body);
      sendSuccess(res, profile, 200, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async stats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contextBuilderService } = await import('../../services/career/context-builder.service.js');
      const stats = await contextBuilderService.build(req.dbUserId!);
      sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export const profileController = new ProfileController();
