import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    return this.prisma.announcement.findMany({
      where: departmentId
        ? { OR: [{ departmentId: null }, { departmentId }] }
        : {},
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { title: string; body: string; createdById: string; departmentId?: string }) {
    return this.prisma.announcement.create({ data });
  }

  async remove(id: string) {
    return this.prisma.announcement.delete({ where: { id } });
  }
}