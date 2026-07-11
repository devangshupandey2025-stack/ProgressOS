import { TrackerSource } from '@prisma/client';
import { MetricHandler, MetricResult } from './types.js';
import { getLeetCodeSolved, getLeetCodeEasySolved, getLeetCodeMediumSolved, getLeetCodeHardSolved, getLeetCodeRating, getLeetCodeContests, getLeetCodeVelocity, getLeetCodeReadiness, getLeetCodeMonthlyGrowth, getLeetCodeHardRatio } from './leetcode.metric.js';
import { getCodeforcesRating, getCodeforcesSolved } from './codeforces.metric.js';
import { getProjectsCompleted } from './project.metric.js';
import { getOpenSourcePRs } from './opensource.metric.js';
import { getGitHubRepositories, getGitHubProjects, getGitHubActivity, getGitHubCommits, getGitHubReadiness } from './github.metric.js';
import { getVitCgpa, getVitCredits, getVitAttendance, getVitReadiness } from './vit.metric.js';


export * from './types.js';

export class MetricRegistry {
  private static cache = new Map<string, { result: MetricResult; timestamp: number }>();
  private static readonly CACHE_TTL_MS = 15000;

  private static handlers: Record<Exclude<TrackerSource, 'MANUAL'>, MetricHandler> = {
    LEETCODE_SOLVED: getLeetCodeSolved,
    LEETCODE_EASY_SOLVED: getLeetCodeEasySolved,
    LEETCODE_MEDIUM_SOLVED: getLeetCodeMediumSolved,
    LEETCODE_HARD_SOLVED: getLeetCodeHardSolved,
    LEETCODE_RATING: getLeetCodeRating,
    LEETCODE_CONTESTS: getLeetCodeContests,
    LEETCODE_VELOCITY: getLeetCodeVelocity,
    LEETCODE_READINESS: getLeetCodeReadiness,
    LEETCODE_MONTHLY_GROWTH: getLeetCodeMonthlyGrowth,
    LEETCODE_HARD_RATIO: getLeetCodeHardRatio,
    CODEFORCES_RATING: getCodeforcesRating,
    CODEFORCES_SOLVED: getCodeforcesSolved,
    PROJECTS_COMPLETED: getProjectsCompleted,
    OPENSOURCE_PRS: getOpenSourcePRs,
    GITHUB_REPOSITORIES: getGitHubRepositories,
    GITHUB_PROJECTS: getGitHubProjects,
    GITHUB_ACTIVITY: getGitHubActivity,
    GITHUB_COMMITS: getGitHubCommits,
    GITHUB_READINESS: getGitHubReadiness,
    VIT_CGPA: getVitCgpa,
    VIT_CREDITS: getVitCredits,
    VIT_ATTENDANCE: getVitAttendance,
    VIT_READINESS: getVitReadiness,

  };

  static async resolve(source: TrackerSource, userId: string, target?: number): Promise<MetricResult> {
    if (source === TrackerSource.MANUAL) {
      return { current: 0 };
    }

    const handler = this.handlers[source];
    if (!handler) {
      throw new Error(`Metric handler for source '${source}' not registered`);
    }

    const cacheKey = `${userId}_${source}_${target || 0}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.result;
    }

    const result = await handler(userId, target);
    this.cache.set(cacheKey, { result, timestamp: now });

    return result;
  }
}
