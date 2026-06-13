import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateUserSchema } from '../validators/user.validator.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

/**
 * GET /api/user/me
 * Returns the authenticated user's profile.
 */
router.get(
  '/me',
  requireAuth,
  (req, res, next) => userController.getMe(req as AuthenticatedRequest, res, next)
);

/**
 * PUT /api/user/me
 * Updates the authenticated user's profile.
 */
router.put(
  '/me',
  requireAuth,
  validate(updateUserSchema),
  (req, res, next) => userController.updateMe(req as AuthenticatedRequest, res, next)
);

export default router;
