import { Response, NextFunction } from 'express';
import { Request } from 'express';
import { publicProfileService } from '../services/public-profile.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class PublicProfileController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const username = req.params.username as string;
      if (!username) {
        sendError(res, 'Username is required', 400);
        return;
      }
      const result = await publicProfileService.getByUsername(username);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const publicProfileController = new PublicProfileController();
