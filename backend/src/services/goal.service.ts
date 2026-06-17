import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { TrackerSource } from '@prisma/client';
import { MetricRegistry } from '../metrics/index.js';

export class GoalService {
  /**
   * Find all active goals for a user.
   */
  async findAll(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      goals.map(async (goal) => {
        if (goal.trackerSource && goal.trackerSource !== TrackerSource.MANUAL) {
          try {
            const metrics = await MetricRegistry.resolve(goal.trackerSource, userId, goal.target);
            return {
              ...goal,
              current: metrics.current,
              remaining: metrics.remaining,
              progressPercentage: metrics.progressPercentage,
              recommendation: metrics.recommendation,
            };
          } catch (err) {
            console.error(`Failed to resolve metric for goal ${goal.id}:`, err);
          }
        }

        // Manual goals fallback calculation
        const progressPercentage = Math.min(100, Math.max(0, Math.round((goal.current / goal.target) * 100)));
        const remaining = Math.max(0, goal.target - goal.current);
        const recommendation = remaining > 0 ? `${remaining} remaining` : 'Goal achieved!';

        return {
          ...goal,
          remaining,
          progressPercentage,
          recommendation,
        };
      })
    );
  }

  /**
   * Create a new goal for a user.
   */
  async create(
    userId: string,
    data: { title: string; target: number; current: number; unit: string; trackerSource?: TrackerSource }
  ) {
    return prisma.goal.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  /**
   * Delete a goal by ID, confirming ownership.
   */
  async delete(userId: string, id: string) {
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw AppError.notFound('Goal not found');
    }

    return prisma.goal.delete({
      where: { id },
    });
  }
}

export const goalService = new GoalService();
