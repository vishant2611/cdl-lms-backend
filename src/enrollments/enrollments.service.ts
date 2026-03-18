import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async enroll(userId: string, courseId: string) {
    const exists = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (exists) return exists;
    return this.prisma.enrollment.create({
      data: { userId, courseId, status: 'NOT_STARTED' },
    });
  }

  async updateProgress(userId: string, courseId: string, progressPct: number) {
    const status = progressPct >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
    return this.prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: {
        progressPct,
        status,
        startedAt: progressPct > 0 ? new Date() : undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  async getMyEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: { id: true, title: true, type: true, thumbnailUrl: true, duration: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async assignToUser(instructorId: string, userId: string, courseId: string) {
    return this.enroll(userId, courseId);
  }

  async assignToGroup(groupId: string, courseId: string) {
    const members = await this.prisma.userGroupMember.findMany({
      where: { userGroupId: groupId },
    });
    return Promise.all(members.map(m => this.enroll(m.userId, courseId)));
  }

  async assignToDepartment(departmentId: string, courseId: string) {
    const users = await this.prisma.user.findMany({
      where: { departmentId, isActive: true },
    });
    return Promise.all(users.map(u => this.enroll(u.id, courseId)));
  }
}