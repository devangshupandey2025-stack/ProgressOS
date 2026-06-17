import { Router } from 'express';
import { goalController } from '../controllers/goal.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createGoalSchema } from '../validators/goal.validator.js';
import { AuthenticatedRequest } from '../types/index.js';

const router = Router();

/**
 * GET /api/goals
 * List all goals.
 */
router.get(
  '/',
  requireAuth,
  (req, res, next) => goalController.findAll(req as AuthenticatedRequest, res, next)
);

/**
 * POST /api/goals
 * Create a new goal.
 */
router.post(
  '/',
  requireAuth,
  validate(createGoalSchema),
  (req, res, next) => goalController.create(req as AuthenticatedRequest, res, next)
);

/**
 * DELETE /api/goals/:id
 * Delete a goal.
 */
router.delete(
  '/:id',
  requireAuth,
  (req, res, next) => goalController.delete(req as AuthenticatedRequest, res, next)
);

export default router;
