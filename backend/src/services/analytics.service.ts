import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';

interface WeeklyDataPoint {
  weekStart: string;
  label: string;
  xp: number;
  dsaXP: number;
  projectXP: number;
  academicsXP: number;
  openSourceXP: number;
}

interface LeetCodeHistoryPoint {
  weekStart: string;
  totalSolved: number;
  contestRating: number | null;
}

interface GitHubHistoryPoint {
  weekStart: string;
  repoCount: number;
  stars: number;
  commits: number;
}

interface GoalStat {
  total: number;
  completed: number;
  completionRate: number;
  onTrack: number;
}

export interface AnalyticsResponse {
  xpGrowth: WeeklyDataPoint[];
  leetCodeHistory: LeetCodeHistoryPoint[];
  gitHubHistory: GitHubHistoryPoint[];
  goalStats: GoalStat;
  totalXP: number;
  totalActivities: number;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(weekStart: Date): string {
  const start = weekStart;
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[start.getMonth()]} ${start.getDate()}`;
}

export class AnalyticsService {
  async generate(userId: string): Promise<AnalyticsResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User not found');

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // ── Weekly XP Growth ────────────────────────────────────
    const activities = await prisma.activity.findMany({
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: 'asc' },
    });

    const weeklyMap = new Map<string, WeeklyDataPoint>();
    activities.forEach(a => {
      const ws = getWeekStart(a.createdAt);
      const key = ws.toISOString();
      if (!weeklyMap.has(key)) {
        weeklyMap.set(key, {
          weekStart: ws.toISOString(),
          label: formatWeekLabel(ws),
          xp: 0, dsaXP: 0, projectXP: 0, academicsXP: 0, openSourceXP: 0,
        });
      }
      const w = weeklyMap.get(key)!;
      w.xp += a.xp;
      if (a.category === 'DSA') w.dsaXP += a.xp;
      else if (a.category === 'PROJECT') w.projectXP += a.xp;
      else if (a.category === 'ACADEMICS') w.academicsXP += a.xp;
      else if (a.category === 'OPEN_SOURCE') w.openSourceXP += a.xp;
    });

    Object.values(Object.fromEntries(weeklyMap)).forEach(w => {
      w.xp = Math.round(w.xp);
      w.dsaXP = Math.round(w.dsaXP);
      w.projectXP = Math.round(w.projectXP);
      w.academicsXP = Math.round(w.academicsXP);
      w.openSourceXP = Math.round(w.openSourceXP);
    });

    const xpGrowth = Array.from(weeklyMap.values()).sort(
      (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
    );

    // ── LeetCode History ─────────────────────────────────────
    const lcSnapshots = await prisma.leetCodeSnapshot.findMany({
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: 'asc' },
    });

    const lcWeeklyMap = new Map<string, LeetCodeHistoryPoint>();
    lcSnapshots.forEach(s => {
      const ws = getWeekStart(s.createdAt);
      const key = ws.toISOString();
      if (!lcWeeklyMap.has(key) || s.createdAt > new Date(lcWeeklyMap.get(key)!.weekStart)) {
        lcWeeklyMap.set(key, {
          weekStart: ws.toISOString(),
          totalSolved: s.totalSolved,
          contestRating: s.contestRating,
        });
      }
    });

    const leetCodeHistory = Array.from(lcWeeklyMap.values()).sort(
      (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
    );

    // ── GitHub History ───────────────────────────────────────
    const ghSnapshots = await prisma.gitHubSnapshot.findMany({
      where: { userId, createdAt: { gte: sixMonthsAgo } },
      orderBy: { createdAt: 'asc' },
    });

    const ghWeeklyMap = new Map<string, GitHubHistoryPoint>();
    ghSnapshots.forEach(s => {
      const ws = getWeekStart(s.createdAt);
      const key = ws.toISOString();
      if (!ghWeeklyMap.has(key) || s.createdAt > new Date(ghWeeklyMap.get(key)!.weekStart)) {
        ghWeeklyMap.set(key, {
          weekStart: ws.toISOString(),
          repoCount: s.repoCount,
          stars: s.stars,
          commits: s.commits,
        });
      }
    });

    const gitHubHistory = Array.from(ghWeeklyMap.values()).sort(
      (a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
    );

    // ── Goal Statistics ──────────────────────────────────────
    const allGoals = await prisma.goal.findMany({ where: { userId } });
    const completed = allGoals.filter(g => g.current >= g.target).length;
    const onTrack = allGoals.filter(g => g.current / g.target >= 0.5 && g.current < g.target).length;

    const totalActivities = await prisma.activity.count({ where: { userId } });

    return {
      xpGrowth,
      leetCodeHistory,
      gitHubHistory,
      goalStats: {
        total: allGoals.length,
        completed,
        completionRate: allGoals.length > 0 ? Math.round((completed / allGoals.length) * 100) : 0,
        onTrack,
      },
      totalXP: user.totalXP,
      totalActivities,
    };
  }
}

export const analyticsService = new AnalyticsService();
