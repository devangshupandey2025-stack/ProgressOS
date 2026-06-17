import { prisma } from '../config/database.js';
import { leetCodeService } from '../integrations/leetcode/leetcode.service.js';
import { MetricHandler, MetricResult } from './types.js';

export const getLeetCodeSolved: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true },
  });

  if (!user || !user.leetcodeUsername) {
    return { current: 0, recommendation: 'Connect LeetCode username in Settings' };
  }

  try {
    const profile = await leetCodeService.getProfile(userId, user.leetcodeUsername);
    const current = profile.totalSolved;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));

      if (remaining > 0) {
        result.recommendation = `${remaining} problems remaining to reach target`;
      } else {
        result.recommendation = 'Goal achieved!';
      }
    }

    return result;
  } catch (err) {
    console.error('LeetCode solved metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch LeetCode profile' };
  }
};

export const getLeetCodeEasySolved: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true },
  });

  if (!user || !user.leetcodeUsername) {
    return { current: 0, recommendation: 'Connect LeetCode username in Settings' };
  }

  try {
    const profile = await leetCodeService.getProfile(userId, user.leetcodeUsername);
    const current = profile.easy;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} easy problems remaining` : 'Goal achieved!';
    }

    return result;
  } catch (err) {
    console.error('LeetCode easy metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch LeetCode profile' };
  }
};

export const getLeetCodeMediumSolved: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true },
  });

  if (!user || !user.leetcodeUsername) {
    return { current: 0, recommendation: 'Connect LeetCode username in Settings' };
  }

  try {
    const profile = await leetCodeService.getProfile(userId, user.leetcodeUsername);
    const current = profile.medium;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} medium problems remaining` : 'Goal achieved!';
    }

    return result;
  } catch (err) {
    console.error('LeetCode medium metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch LeetCode profile' };
  }
};

export const getLeetCodeHardSolved: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true },
  });

  if (!user || !user.leetcodeUsername) {
    return { current: 0, recommendation: 'Connect LeetCode username in Settings' };
  }

  try {
    const profile = await leetCodeService.getProfile(userId, user.leetcodeUsername);
    const current = profile.hard;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} hard problems remaining` : 'Goal achieved!';
    }

    return result;
  } catch (err) {
    console.error('LeetCode hard metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch LeetCode profile' };
  }
};

export const getLeetCodeRating: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true },
  });

  if (!user || !user.leetcodeUsername) {
    return { current: 0, recommendation: 'Connect LeetCode username in Settings' };
  }

  try {
    const contest = await leetCodeService.getContestInfo(userId, user.leetcodeUsername);
    const current = Math.round(contest.rating);
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} rating remaining to reach target` : 'Goal achieved!';
    }

    return result;
  } catch (err) {
    console.error('LeetCode rating metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch LeetCode contest rating' };
  }
};

export const getLeetCodeContests: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true },
  });

  if (!user || !user.leetcodeUsername) {
    return { current: 0, recommendation: 'Connect LeetCode username in Settings' };
  }

  try {
    const contest = await leetCodeService.getContestInfo(userId, user.leetcodeUsername);
    const current = contest.attendedContestsCount;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} contests remaining to reach target` : 'Goal achieved!';
    }

    return result;
  } catch (err) {
    console.error('LeetCode contests metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch LeetCode contest info' };
  }
};

export const getLeetCodeVelocity: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true },
  });
  if (!user || !user.leetcodeUsername) {
    return { current: 0, recommendation: 'Connect LeetCode username in Settings' };
  }
  try {
    const analytics = await leetCodeService.getAnalytics(userId, user.leetcodeUsername);
    const current = analytics.weeklyAverage;
    const result: MetricResult = { current };
    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} problems/week needed to reach target velocity` : 'Velocity goal achieved!';
    }
    return result;
  } catch {
    return { current: 0, recommendation: 'Failed to compute velocity' };
  }
};

export const getLeetCodeReadiness: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true },
  });
  if (!user || !user.leetcodeUsername) {
    return { current: 0, recommendation: 'Connect LeetCode username in Settings' };
  }
  try {
    const readiness = await leetCodeService.getReadiness(userId, user.leetcodeUsername);
    const current = readiness.dsaReadiness;
    const result: MetricResult = { current };
    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} points needed to reach DSA Readiness target` : 'Readiness goal achieved!';
    }
    return result;
  } catch {
    return { current: 0, recommendation: 'Failed to compute readiness' };
  }
};

export const getLeetCodeMonthlyGrowth: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true },
  });
  if (!user || !user.leetcodeUsername) {
    return { current: 0, recommendation: 'Connect LeetCode username in Settings' };
  }
  try {
    const analytics = await leetCodeService.getAnalytics(userId, user.leetcodeUsername);
    const current = analytics.monthlyGrowth;
    const result: MetricResult = { current };
    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} problems needed this month` : 'Monthly growth goal achieved!';
    }
    return result;
  } catch {
    return { current: 0, recommendation: 'Failed to compute monthly growth' };
  }
};

export const getLeetCodeHardRatio: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { leetcodeUsername: true },
  });
  if (!user || !user.leetcodeUsername) {
    return { current: 0, recommendation: 'Connect LeetCode username in Settings' };
  }
  try {
    const analytics = await leetCodeService.getAnalytics(userId, user.leetcodeUsername);
    const current = analytics.problemDistribution.hardPercentage;
    const result: MetricResult = { current };
    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `Hard ratio ${current}%, need ${remaining}% more to reach target` : 'Hard ratio goal achieved!';
    }
    return result;
  } catch {
    return { current: 0, recommendation: 'Failed to compute hard ratio' };
  }
};
