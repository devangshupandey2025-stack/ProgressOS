import { Response, NextFunction } from 'express';
import { reportService } from '../services/report.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ReportController {
  public async getCareerSnapshot(req: any, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthenticatedRequest;
      const pdfBuffer = await reportService.generateCareerSnapshot(authReq.dbUserId!);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=Career-Snapshot.pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
