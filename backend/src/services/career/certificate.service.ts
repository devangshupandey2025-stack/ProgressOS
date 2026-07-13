import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';

export class CertificateService {
  async list(userId: string) {
    return prisma.certificate.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: string, data: { name: string; issuer?: string | null; credentialUrl?: string | null }) {
    return prisma.certificate.create({
      data: {
        userId,
        name: data.name,
        issuer: data.issuer ?? null,
        credentialUrl: data.credentialUrl ?? null,
      },
    });
  }

  async update(userId: string, id: string, data: { name?: string; issuer?: string | null; credentialUrl?: string | null }) {
    const existing = await prisma.certificate.findFirst({
      where: { id, userId },
    });
    if (!existing) throw AppError.notFound('Certificate not found');

    return prisma.certificate.update({
      where: { id },
      data,
    });
  }

  async delete(userId: string, id: string) {
    const existing = await prisma.certificate.findFirst({
      where: { id, userId },
    });
    if (!existing) throw AppError.notFound('Certificate not found');

    await prisma.certificate.delete({ where: { id } });
  }
}

export const certificateService = new CertificateService();
