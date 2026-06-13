import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';

/**
 * User Controller
 *
 * Handles HTTP request/response for user-related endpoints.
 * Delegates business logic to the UserService.
 */
export class UserController {
  /**
   * GET /api/user/me
   * Returns the authenticated user's profile.
   */
  async getMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userService.getUserById(req.dbUserId!);
      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/user/me
   * Updates the authenticated user's profile.
   */
  async updateMe(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await userService.updateUser(req.dbUserId!, req.body);
      sendSuccess(res, user, 200, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
