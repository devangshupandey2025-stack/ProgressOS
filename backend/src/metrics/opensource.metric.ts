import { prisma } from '../config/database.js';
import { MetricHandler, MetricResult } from './types.js';

export const getOpenSourcePRs: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const current = await prisma.openSourceEntry.count({
    where: { userId },
  });

  const result: MetricResult = { current };

  if (target && target > 0) {
    const remaining = Math.max(0, target - current);
    result.remaining = remaining;
    result.progressPercentage = Math.min(100, Math.round((current / target) * 100));

    if (remaining > 0) {
      result.recommendation = `${remaining} contributions remaining to achieve goal`;
    } else {
      result.recommendation = 'Goal achieved!';
    }
  }

  return result;
};
