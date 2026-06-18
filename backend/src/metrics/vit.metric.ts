import { prisma } from '../config/database.js';
import { vitService } from '../integrations/vit/vit.service.js';
import { MetricHandler, MetricResult } from './types.js';

export const getVitCgpa: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { vitUsername: true },
  });
  if (!user || !user.vitUsername) {
    return { current: 0, recommendation: 'Connect VIT account in Settings' };
  }
  try {
    const profile = await vitService.getProfile(userId);
    const current = profile.cgpa;
    const result: MetricResult = { current };
    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = parseFloat(remaining.toFixed(2));
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0
        ? `${remaining.toFixed(2)} CGPA points remaining to reach target`
        : 'Goal achieved!';
    }
    return result;
  } catch (err) {
    console.error('VIT CGPA metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch VIT CGPA' };
  }
};

export const getVitCredits: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { vitUsername: true },
  });
  if (!user || !user.vitUsername) {
    return { current: 0, recommendation: 'Connect VIT account in Settings' };
  }
  try {
    const profile = await vitService.getProfile(userId);
    const current = profile.creditsEarned;
    const result: MetricResult = { current };
    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = profile.creditsRequired > 0
        ? `${remaining} credits remaining (${profile.creditsRequired} required total)`
        : 'Goal achieved!';
    }
    return result;
  } catch (err) {
    console.error('VIT credits metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch VIT credits' };
  }
};

export const getVitAttendance: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { vitUsername: true },
  });
  if (!user || !user.vitUsername) {
    return { current: 0, recommendation: 'Connect VIT account in Settings' };
  }
  try {
    const profile = await vitService.getProfile(userId);
    const current = profile.attendance;
    const result: MetricResult = { current };
    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = parseFloat(remaining.toFixed(2));
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0
        ? `${remaining.toFixed(1)}% attendance needed to reach target`
        : 'Attendance goal achieved!';
    }
    return result;
  } catch (err) {
    console.error('VIT attendance metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch VIT attendance' };
  }
};

export const getVitReadiness: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { vitUsername: true },
  });
  if (!user || !user.vitUsername) {
    return { current: 0, recommendation: 'Connect VIT account in Settings' };
  }
  try {
    const analytics = await vitService.getAnalytics(userId);
    const current = analytics.academicReadiness;
    const result: MetricResult = { current };
    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0
        ? `${remaining} points needed to reach Academic Readiness target`
        : 'Readiness goal achieved!';
    }
    return result;
  } catch (err) {
    console.error('VIT readiness metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to compute Academic Readiness' };
  }
};
