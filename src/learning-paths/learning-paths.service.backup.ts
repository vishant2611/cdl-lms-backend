import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearningPathsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.learningPath.findMany({
      where: { isPublished: true },
      include: {
        pathCourses: { include: { course: true }, orderBy: { order: 'asc' } },
        _count: { select: { pathEnrollments: true } },
      },
    });
  }

  async findOne(id: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      include: {
        pathCourses: { include: { course: true }, orderBy: { order: 'asc' } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    if (!path) throw new NotFoundException('Learning path not found');
    return path;
  }

  async create(data: { title: string; description?: string; courseIds: string[]; createdById: string }) {
    return this.prisma.learningPath.create({
      data: {
        title: data.title,
        description: data.description,
        createdById: data.createdById,
        pathCourses: {
          create: data.courseIds.map((courseId, index) => ({ courseId, order: index + 1 })),
        },
      },
      include: { pathCourses: { include: { course: true } } },
    });
  }

  async enroll(userId: string, learningPathId: string) {
    const exists = await this.prisma.pathEnrollment.findUnique({
      where: { userId_learningPathId: { userId, learningPathId } },
    });
    if (exists) return exists;
    return this.prisma.pathEnrollment.create({
      data: { userId, learningPathId, status: 'NOT_STARTED' },
    });
  }

  async getMyPaths(userId: string) {
    return this.prisma.pathEnrollment.findMany({
      where: { userId },
      include: {
        learningPath: {
          include: { pathCourses: { include: { course: true }, orderBy: { order: 'asc' } } },
        },
      },
    });
  }
}