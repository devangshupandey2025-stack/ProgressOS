import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../config/database.js';
import { vitService } from '../integrations/vit/vit.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).dbUserId!;
    
    // Fetch user basic data
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Determine current level (e.g., Level = totalXP / 1000 + 1)
    const currentLevel = Math.floor(user.totalXP / 1000) + 1;
    const currentXP = user.totalXP % 1000;
    const nextLevelXP = 1000;
    const levelProgress = Math.round((currentXP / nextLevelXP) * 100);

    // Get weekly XP (from activities in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyActivities = await prisma.activity.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo }
      }
    });
    
    const weeklyXP = weeklyActivities.reduce((sum, act) => sum + act.xp, 0);

    // VIT Academic Card
    let vit = null;
    if (user.vitUsername) {
      try {
        const profile = await vitService.getProfile(userId);
        const analytics = await vitService.getAnalytics(userId);
        vit = {
          connected: true,
          username: user.vitUsername,
          lastSync: user.vitLastSync?.toISOString() ?? null,
          cgpa: profile.cgpa,
          creditsEarned: profile.creditsEarned,
          creditsRequired: profile.creditsRequired,
          attendance: profile.attendance,
          academicReadiness: analytics.academicReadiness,
          creditsProgress: analytics.creditsProgress,
        };
      } catch {
        vit = {
          connected: true,
          username: user.vitUsername,
          lastSync: user.vitLastSync?.toISOString() ?? null,
          error: 'Failed to sync VIT data',
        };
      }
    }

    // Dashboard response
    sendSuccess(res, {
      user: {
        name: user.name,
        email: user.email,
        totalXP: user.totalXP,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak
      },
      level: {
        current: currentLevel,
        currentXP,
        nextLevelXP,
        progress: levelProgress,
        remainingXP: nextLevelXP - currentXP
      },
      weeklyXP,
      monthlyXP: weeklyXP * 4,
      vit,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
