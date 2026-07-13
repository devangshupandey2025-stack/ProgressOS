import { Response, NextFunction } from 'express';
import { reportService } from '../services/report.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ReportController {
  public async getCareerSnapshot(req: any, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.dbUserId!;
      const resumeProfileId = req.query.resumeProfileId as string | undefined;

      let pdfBuffer: Buffer;
      let filename = 'Career-Snapshot.pdf';

      if (resumeProfileId) {
        pdfBuffer = await reportService.generateResumePDF(userId, resumeProfileId);
        filename = `Resume-${resumeProfileId.slice(0, 8)}.pdf`;
      } else {
        pdfBuffer = await reportService.generateCareerSnapshot(userId);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
