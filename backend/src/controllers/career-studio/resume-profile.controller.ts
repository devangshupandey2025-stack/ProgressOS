import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { resumeProfileService } from '../../services/career/resume-profile.service.js';
import { sendSuccess } from '../../utils/response.js';

export class ResumeProfileController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profiles = await resumeProfileService.list(req.dbUserId!);
      sendSuccess(res, profiles);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const profile = await resumeProfileService.getById(req.dbUserId!, id);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await resumeProfileService.create(req.dbUserId!, req.body);
      sendSuccess(res, profile, 201, 'Resume profile created');
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const profile = await resumeProfileService.update(req.dbUserId!, id, req.body);
      sendSuccess(res, profile, 200, 'Resume profile updated');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await resumeProfileService.delete(req.dbUserId!, id);
      sendSuccess(res, null, 200, 'Resume profile deleted');
    } catch (error) {
      next(error);
    }
  }

  async clone(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const profile = await resumeProfileService.clone(req.dbUserId!, id);
      sendSuccess(res, profile, 201, 'Resume profile cloned');
    } catch (error) {
      next(error);
    }
  }

  async setDefault(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const profile = await resumeProfileService.setDefault(req.dbUserId!, id);
      sendSuccess(res, profile, 200, 'Default resume profile updated');
    } catch (error) {
      next(error);
    }
  }
}

export const resumeProfileController = new ResumeProfileController();
