import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types/index.js';
import { resumeCompositionService } from '../../services/career/resume-composition.service.js';
import { certificateService } from '../../services/career/certificate.service.js';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../utils/response.js';

export class ResumeCompositionController {
  // ─── Projects ─────────────────────────────────────────────────────────────

  async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeCompositionService.getProjects(req.dbUserId!, id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async updateProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeCompositionService.updateProjects(req.dbUserId!, id, req.body.selections ?? []);
      sendSuccess(res, data, 200, 'Projects updated');
    } catch (error) {
      next(error);
    }
  }

  // ─── Certificates ─────────────────────────────────────────────────────────

  async getCertificates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeCompositionService.getCertificates(req.dbUserId!, id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async updateCertificates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeCompositionService.updateCertificates(req.dbUserId!, id, req.body.selections ?? []);
      sendSuccess(res, data, 200, 'Certificates updated');
    } catch (error) {
      next(error);
    }
  }

  // ─── Achievements ─────────────────────────────────────────────────────────

  async getAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeCompositionService.getAchievements(req.dbUserId!, id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async updateAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeCompositionService.updateAchievements(req.dbUserId!, id, req.body.selections ?? []);
      sendSuccess(res, data, 200, 'Achievements updated');
    } catch (error) {
      next(error);
    }
  }

  // ─── Sections ─────────────────────────────────────────────────────────────

  async getSections(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeCompositionService.getSectionSettings(req.dbUserId!, id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async updateSections(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeCompositionService.updateSectionSettings(req.dbUserId!, id, req.body);
      sendSuccess(res, data, 200, 'Section settings updated');
    } catch (error) {
      next(error);
    }
  }

  // ─── Context Preview v1 (legacy) ─────────────────────────────────────────

  async getContextV1(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await resumeCompositionService.buildContextV1(req.dbUserId!, id);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  // ─── Resume Context (canonical) ─────────────────────────────────────────

  async getContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const context = await resumeCompositionService.buildResumeContext(req.dbUserId!, id);
      sendSuccess(res, context);
    } catch (error) {
      next(error);
    }
  }

  // ─── Standalone Certificate Management ────────────────────────────────────

  async listCertificates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await certificateService.list(req.dbUserId!);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async createCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await certificateService.create(req.dbUserId!, req.body);
      sendSuccess(res, data, 201, 'Certificate created');
    } catch (error) {
      next(error);
    }
  }

  async updateCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await certificateService.update(req.dbUserId!, id, req.body);
      sendSuccess(res, data, 200, 'Certificate updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await certificateService.delete(req.dbUserId!, id);
      sendSuccess(res, null, 200, 'Certificate deleted');
    } catch (error) {
      next(error);
    }
  }

  // ─── Project Bullets ─────────────────────────────────────────────────────

  async listBullets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId as string;

      const bullets = await prisma.projectBullet.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
      });

      sendSuccess(res, bullets);
    } catch (error) {
      next(error);
    }
  }

  async createBullet(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId as string;
      const { text } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        res.status(400).json({ success: false, error: 'Bullet text is required' });
        return;
      }

      const lastBullet = await prisma.projectBullet.findFirst({
        where: { projectId },
        orderBy: { displayOrder: 'desc' },
      });

      const bullet = await prisma.projectBullet.create({
        data: {
          projectId,
          text: text.trim(),
          displayOrder: (lastBullet?.displayOrder ?? -1) + 1,
        },
      });

      sendSuccess(res, bullet, 201, 'Bullet created');
    } catch (error) {
      next(error);
    }
  }

  async updateBullet(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const bulletId = req.params.bulletId as string;
      const { text } = req.body;

      const bullet = await prisma.projectBullet.findUnique({ where: { id: bulletId } });
      if (!bullet) {
        res.status(404).json({ success: false, error: 'Bullet not found' });
        return;
      }

      const updated = await prisma.projectBullet.update({
        where: { id: bulletId },
        data: { text: text.trim() },
      });

      sendSuccess(res, updated, 200, 'Bullet updated');
    } catch (error) {
      next(error);
    }
  }

  async deleteBullet(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const bulletId = req.params.bulletId as string;

      const bullet = await prisma.projectBullet.findUnique({ where: { id: bulletId } });
      if (!bullet) {
        res.status(404).json({ success: false, error: 'Bullet not found' });
        return;
      }

      await prisma.projectBullet.delete({ where: { id: bulletId } });
      sendSuccess(res, null, 200, 'Bullet deleted');
    } catch (error) {
      next(error);
    }
  }

  async reorderBullets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.projectId as string;
      const { bulletIds } = req.body;

      if (!Array.isArray(bulletIds)) {
        res.status(400).json({ success: false, error: 'bulletIds array is required' });
        return;
      }

      await prisma.$transaction(
        bulletIds.map((bulletId: string, index: number) =>
          prisma.projectBullet.update({
            where: { id: bulletId },
            data: { displayOrder: index },
          })
        )
      );

      sendSuccess(res, null, 200, 'Bullets reordered');
    } catch (error) {
      next(error);
    }
  }
}

export const resumeCompositionController = new ResumeCompositionController();
