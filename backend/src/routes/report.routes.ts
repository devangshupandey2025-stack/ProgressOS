import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/career', requireAuth, reportController.getCareerSnapshot.bind(reportController));

export default router;
