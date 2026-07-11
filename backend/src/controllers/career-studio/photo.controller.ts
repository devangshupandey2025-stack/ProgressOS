import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { careerPhotoService } from '../../services/career/photo.service.js';
import { sendSuccess } from '../../utils/response.js';

export class PhotoController {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const photos = await careerPhotoService.getPhotos(req.dbUserId!);
      sendSuccess(res, photos);
    } catch (error) {
      next(error);
    }
  }

  async upload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file provided' });
        return;
      }
      const photo = await careerPhotoService.upload(req.dbUserId!, req.file);
      sendSuccess(res, photo, 201, 'Photo uploaded successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      await careerPhotoService.delete(req.dbUserId!, id);
      sendSuccess(res, null, 200, 'Photo deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async setDefault(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const photo = await careerPhotoService.setDefault(req.dbUserId!, id);
      sendSuccess(res, photo, 200, 'Default photo updated');
    } catch (error) {
      next(error);
    }
  }
}

export const photoController = new PhotoController();
