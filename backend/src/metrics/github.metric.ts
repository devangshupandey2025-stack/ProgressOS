import { prisma } from '../config/database.js';
import { gitHubService } from '../integrations/github/github.service.js';
import { MetricHandler, MetricResult } from './types.js';

export const getGitHubRepositories: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubUsername: true },
  });

  if (!user || !user.githubUsername) {
    return { current: 0, recommendation: 'Connect GitHub username in Settings' };
  }

  try {
    const repos = await gitHubService.getRepositories(userId, user.githubUsername);
    const current = repos.length;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} more repositories to reach target` : 'Goal achieved!';
    }

    return result;
  } catch (err) {
    console.error('GitHub repositories metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch GitHub repositories' };
  }
};

export const getGitHubProjects: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubUsername: true },
  });

  if (!user || !user.githubUsername) {
    return { current: 0, recommendation: 'Connect GitHub username in Settings' };
  }

  try {
    const activity = await gitHubService.getActivity(userId, user.githubUsername);
    const current = activity.activeProjects;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} active projects needed to reach target` : 'Goal achieved!';
    }

    return result;
  } catch (err) {
    console.error('GitHub projects metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch GitHub activity' };
  }
};

export const getGitHubActivity: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubUsername: true },
  });

  if (!user || !user.githubUsername) {
    return { current: 0, recommendation: 'Connect GitHub username in Settings' };
  }

  try {
    const activity = await gitHubService.getActivity(userId, user.githubUsername);
    const current = activity.activeDays;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} active days needed this month` : 'Goal achieved!';
    }

    return result;
  } catch (err) {
    console.error('GitHub activity metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch GitHub activity' };
  }
};

export const getGitHubCommits: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubUsername: true },
  });

  if (!user || !user.githubUsername) {
    return { current: 0, recommendation: 'Connect GitHub username in Settings' };
  }

  try {
    const activity = await gitHubService.getActivity(userId, user.githubUsername);
    const current = activity.commitsLast30Days;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} more commits needed this month` : 'Goal achieved!';
    }

    return result;
  } catch (err) {
    console.error('GitHub commits metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch GitHub commits' };
  }
};

export const getGitHubReadiness: MetricHandler = async (userId, target): Promise<MetricResult> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { githubUsername: true },
  });

  if (!user || !user.githubUsername) {
    return { current: 0, recommendation: 'Connect GitHub username in Settings' };
  }

  try {
    const analytics = await gitHubService.getAnalytics(userId, user.githubUsername);
    const current = analytics.projectReadiness;
    const result: MetricResult = { current };

    if (target && target > 0) {
      const remaining = Math.max(0, target - current);
      result.remaining = remaining;
      result.progressPercentage = Math.min(100, Math.round((current / target) * 100));
      result.recommendation = remaining > 0 ? `${remaining} points to reach project readiness target` : 'Goal achieved!';
    }

    return result;
  } catch (err) {
    console.error('GitHub readiness metric fetch failed:', err);
    return { current: 0, recommendation: 'Failed to fetch GitHub readiness' };
  }
};
