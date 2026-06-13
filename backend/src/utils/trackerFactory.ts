import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';
import { sendSuccess } from './response.js';
import { AppError } from './AppError.js';
import { requireAuth } from '../middleware/auth.js';

export function createTrackerRouter(modelName: string) {
  const router = Router();
  
  // Use any to bypass strict typing for dynamic Prisma model access
  const delegate = (prisma as any)[modelName];

  if (!delegate) {
    throw new Error(`Prisma model '${modelName}' not found`);
  }

  // CREATE
  router.post('/', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = { ...req.body, userId: authReq.dbUserId! };
      const result = await delegate.create({ data });
      sendSuccess(res, result, 201, 'Entry created');
    } catch (e) { next(e); }
  });

  // READ ALL
  router.get('/', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const results = await delegate.findMany({
        where: { userId: authReq.dbUserId! },
        orderBy: { id: 'desc' } // Default ordering
      });
      sendSuccess(res, results);
    } catch (e) { next(e); }
  });

  // READ ONE
  router.get('/:id', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const result = await delegate.findFirst({
        where: { id: req.params.id, userId: authReq.dbUserId! }
      });
      if (!result) throw AppError.notFound('Entry not found');
      sendSuccess(res, result);
    } catch (e) { next(e); }
  });

  // UPDATE
  router.put('/:id', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const exists = await delegate.findFirst({
        where: { id: req.params.id, userId: authReq.dbUserId! }
      });
      if (!exists) throw AppError.notFound('Entry not found');

      const result = await delegate.update({
        where: { id: req.params.id },
        data: req.body
      });
      sendSuccess(res, result, 200, 'Entry updated');
    } catch (e) { next(e); }
  });

  // DELETE
  router.delete('/:id', requireAuth, async (req: any, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const exists = await delegate.findFirst({
        where: { id: req.params.id, userId: authReq.dbUserId! }
      });
      if (!exists) throw AppError.notFound('Entry not found');

      await delegate.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, 200, 'Entry deleted');
    } catch (e) { next(e); }
  });

  return router;
}
