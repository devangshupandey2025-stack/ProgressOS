import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { goalService } from '../services/goal.service.js';
import { sendSuccess } from '../utils/response.js';

export class GoalController {
  /**
   * GET /api/goals
   * List all goals for the authenticated user.
   */
  async findAll(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const goals = await goalService.findAll(req.dbUserId!);
      sendSuccess(res, goals);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/goals
   * Create a new goal.
   */
  async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const goal = await goalService.create(req.dbUserId!, req.body);
      sendSuccess(res, goal, 201, 'Goal created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/goals/:id
   * Delete a goal.
   */
  async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      await goalService.delete(req.dbUserId!, id);
      sendSuccess(res, null, 200, 'Goal deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const goalController = new GoalController();
