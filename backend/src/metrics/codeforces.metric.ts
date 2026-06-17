import { prisma } from '../config/database.js';
import { codeforcesService } from '../integrations/codeforces/codeforces.service.js';
import { MetricHandler, MetricResult } from './types.js';

export const getCodeforcesRating: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { codeforcesHandle: true },
  });

  if (!user || !user.codeforcesHandle) {
    return { current: 0, recommendation: 'Connect Codeforces handle in Settings' };
  }

  try {
    const profile = await codeforcesService.getProfile(userId, user.codeforcesHandle);
    const current = profile.rating || 0;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));

      if (remaining > 0) {
        // Retrieve rating history to calculate average contest gains
        const history = await codeforcesService.getRatingHistory(userId, user.codeforcesHandle).catch(() => []);
        const recent = history.slice(-5);
        let estimatedContests = 0;

        if (recent.length > 0) {
          const totalChange = recent.reduce((sum, h) => sum + h.change, 0);
          const avgChange = totalChange / recent.length;
          estimatedContests = avgChange > 0 ? Math.ceil(remaining / avgChange) : Math.ceil(remaining / 15);
        } else {
          estimatedContests = Math.ceil(remaining / 15);
        }

        result.recommendation = `${remaining} rating remaining. Estimated: ${estimatedContests} Contests`;
      } else {
        result.recommendation = 'Goal achieved!';
      }
    }

    return result;
  } catch (err) {
    console.error('Codeforces rating metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch Codeforces rating' };
  }
};

export const getCodeforcesSolved: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { codeforcesHandle: true },
  });

  if (!user || !user.codeforcesHandle) {
    return { current: 0, recommendation: 'Connect Codeforces handle in Settings' };
  }

  try {
    const analytics = await codeforcesService.getAnalytics(userId, user.codeforcesHandle);
    const current = analytics.solvedCount || 0;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));

      if (remaining > 0) {
        const estimatedWeeks = Math.ceil(remaining / 8); // Estimate 8 problems per week
        result.recommendation = `${remaining} problems remaining. At 8 problems/wk: ${estimatedWeeks} Weeks`;
      } else {
        result.recommendation = 'Goal achieved!';
      }
    }

    return result;
  } catch (err) {
    console.error('Codeforces solved metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch Codeforces solved count' };
  }
};
