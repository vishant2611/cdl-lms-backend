import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async issue(userId: string, courseId: string) {
    return this.prisma.certificate.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
    });
  }

  async getMyCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId },
      include: { course: { select: { id: true, title: true, type: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getAll() {
    return this.prisma.certificate.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }
}