import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';
import { sendSuccess } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const progress = await prisma.gATESyllabusProgress.findMany({
      where: { userId: authReq.dbUserId! },
    });
    sendSuccess(res, progress);
  } catch (e) { next(e); }
});

router.put('/:topicKey', requireAuth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const topicKey = req.params.topicKey;
    const { section, topicLabel, completed } = req.body;

    const existing = await prisma.gATESyllabusProgress.findUnique({
      where: { userId_topicKey: { userId: authReq.dbUserId!, topicKey } },
    });

    let result;
    if (existing) {
      result = await prisma.gATESyllabusProgress.update({
        where: { id: existing.id },
        data: { completed },
      });
    } else {
      result = await prisma.gATESyllabusProgress.create({
        data: { userId: authReq.dbUserId!, topicKey, section, topicLabel, completed },
      });
    }

    sendSuccess(res, result);
  } catch (e) { next(e); }
});

export default router;
