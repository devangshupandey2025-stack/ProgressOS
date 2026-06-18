import { Router } from 'express';
import { publicProfileController } from '../controllers/public-profile.controller.js';

const router = Router();

router.get('/:username', (req, res, next) =>
  publicProfileController.getProfile(req, res, next)
);

export default router;
