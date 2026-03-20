import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearningPathsService {
  constructor(private prisma: PrismaService) {}

  // Published paths for employees
  async findAll() {
    return this.prisma.learningPath.findMany({
      where: { isPublished: true },
      include: {
        pathCourses: { include: { course: true }, orderBy: { order: 'asc' } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { pathEnrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // All paths for admin/instructor/manager
  async findAllManage() {
    return this.prisma.learningPath.findMany({
      include: {
        pathCourses: { include: { course: true }, orderBy: { order: 'asc' } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { pathEnrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userRole?: string) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      include: {
        pathCourses: { include: { course: { include: { quiz: true } } }, orderBy: { order: 'asc' } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { pathEnrollments: true } },
      },
    });
     if (!path) throw new NotFoundException('Learning path not found');
    if (!path.isPublished && userRole === 'EMPLOYEE') throw new NotFoundException('Learning path not found');
    return path;
  }

  async create(data: {
    title: string;
    description?: string;
    courseIds: string[];
    createdById: string;
    thumbnailUrl?: string;
    deadline?: string;
    departmentId?: string;
    userIds?: string[];
  }) {
    const path = await this.prisma.learningPath.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        createdById: data.createdById,
        pathCourses: {
          create: data.courseIds.map((courseId, index) => ({ courseId, order: index + 1 })),
        },
      },
      include: { pathCourses: { include: { course: true } } },
    });

    // Auto-assign if departmentId or userIds provided
    if (data.departmentId || (data.userIds && data.userIds.length > 0)) {
      await this.assign(path.id, {
        departmentId: data.departmentId,
        userIds: data.userIds,
        deadline: data.deadline,
      });
    }

    return path;
  }

  async update(id: string, data: any) {
    const { courseIds, ...rest } = data;
    const updateData: any = { ...rest };

    if (courseIds) {
      // Delete existing path courses and recreate
      await this.prisma.pathCourse.deleteMany({ where: { learningPathId: id } });
      updateData.pathCourses = {
        create: courseIds.map((courseId: string, index: number) => ({ courseId, order: index + 1 })),
      };
    }

    return this.prisma.learningPath.update({
      where: { id },
      data: updateData,
      include: { pathCourses: { include: { course: true }, orderBy: { order: 'asc' } } },
    });
  }

  async remove(id: string) {
    await this.prisma.pathCourse.deleteMany({ where: { learningPathId: id } });
    await this.prisma.pathEnrollment.deleteMany({ where: { learningPathId: id } });
    return this.prisma.learningPath.delete({ where: { id } });
  }

  async publish(id: string, isPublished: boolean) {
    return this.prisma.learningPath.update({
      where: { id },
      data: { isPublished },
    });
  }

  // Assign to department or individual users
  async assign(id: string, data: { departmentId?: string; userIds?: string[]; deadline?: string }) {
    let usersToEnroll: string[] = [];

    // Get users from department
    if (data.departmentId) {
      const deptUsers = await this.prisma.user.findMany({
        where: { departmentId: data.departmentId, isActive: true },
        select: { id: true },
      });
      usersToEnroll = [...usersToEnroll, ...deptUsers.map(u => u.id)];
    }

    // Add individual users
    if (data.userIds && data.userIds.length > 0) {
      usersToEnroll = [...new Set([...usersToEnroll, ...data.userIds])];
    }

    // Enroll all users (skip existing)
    const results: any[] = [];
    for (const userId of usersToEnroll) {
      try {
        const existing = await this.prisma.pathEnrollment.findUnique({
          where: { userId_learningPathId: { userId, learningPathId: id } },
        });
        if (!existing) {
          const enrollment = await this.prisma.pathEnrollment.create({
            data: { userId, learningPathId: id, status: 'NOT_STARTED', ...(data.deadline ? { deadline: new Date(data.deadline) } : {}) },
          });
          results.push(enrollment);
        }
      } catch {}
    }

    return { enrolled: results.length, total: usersToEnroll.length };
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
          include: {
            pathCourses: {
              include: { course: { include: { quiz: true, enrollments: { where: { userId } } } } },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}