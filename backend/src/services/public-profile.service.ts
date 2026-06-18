import { prisma } from '../config/database.js';
import { marketReadinessService } from './market-readiness.service.js';
import { weeklyReviewService } from './weekly-review.service.js';
import { AppError } from '../utils/AppError.js';

export interface PublicProfileResponse {
  username: string;
  name: string | null;
  level: number;
  marketReadiness: number;
  marketReadinessLabel: string;
  dsaScore: number;
  projectsScore: number;
  currentStreak: number;
  longestStreak: number;
  weeklyXP: number;
  totalXP: number;
  achievements: number;
  heatmap: { label: string; intensity: number }[];
  integrations: {
    leetcode: boolean;
    codeforces: boolean;
    github: boolean;
  };
}

export class PublicProfileService {
  async getByUsername(username: string): Promise<PublicProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true, name: true, username: true, totalXP: true,
        currentStreak: true, longestStreak: true,
        leetcodeUsername: true, codeforcesHandle: true, githubUsername: true,
      },
    });
    if (!user) throw AppError.notFound('User not found');

    const level = Math.floor(user.totalXP / 1000) + 1;

    // Market readiness
    let marketReadiness = 0;
    let marketReadinessLabel = 'Getting Started';
    try {
      const mr = await marketReadinessService.compute(user.id);
      marketReadiness = mr.overall;
      marketReadinessLabel = mr.label;
    } catch {}

    // Weekly XP
    let weeklyXP = 0;
    try {
      const wr = await weeklyReviewService.generate(user.id);
      weeklyXP = wr.xpEarned;
    } catch {}

    // Heatmap (7 days)
    let heatmap: { label: string; intensity: number }[] = [];
    try {
      const wr = await weeklyReviewService.generate(user.id);
      heatmap = wr.dailyBreakdown.map(d => ({ label: d.label, intensity: d.intensity }));
    } catch {}

    // Extract DSA and Projects scores from market readiness
    let dsaScore = 0, projectsScore = 0;
    try {
      const mr = await marketReadinessService.compute(user.id);
      const dsaComp = mr.components.find(c => c.label === 'DSA');
      const projComp = mr.components.find(c => c.label === 'Projects');
      if (dsaComp) dsaScore = dsaComp.score;
      if (projComp) projectsScore = projComp.score;
    } catch {}

    return {
      username: user.username || user.name || 'anonymous',
      name: user.name,
      level,
      marketReadiness,
      marketReadinessLabel,
      dsaScore,
      projectsScore,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      weeklyXP,
      totalXP: user.totalXP,
      achievements: 0,
      heatmap,
      integrations: {
        leetcode: !!user.leetcodeUsername,
        codeforces: !!user.codeforcesHandle,
        github: !!user.githubUsername,
      },
    };
  }
}

export const publicProfileService = new PublicProfileService();
