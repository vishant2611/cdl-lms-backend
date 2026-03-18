import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(published?: boolean) {
    return this.prisma.course.findMany({
      where: published !== undefined ? { isPublished: published } : {},
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        quiz: { include: { questions: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(data: {
    title: string;
    description?: string;
    type: any;
    fileUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    createdById: string;
  }) {
    return this.prisma.course.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.course.update({ where: { id }, data });
  }

  async publish(id: string) {
    return this.prisma.course.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async remove(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }
}