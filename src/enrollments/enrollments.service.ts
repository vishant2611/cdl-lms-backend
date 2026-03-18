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
    const now = new Date();

    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    const enrollment = await this.prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: {
        progressPct: Math.min(100, progressPct),
        status,
        startedAt: existing?.startedAt || now,
        completedAt: status === 'COMPLETED' ? now : undefined,
      },
    });

    // Award points on completion
    if (status === 'COMPLETED' && existing?.status !== 'COMPLETED') {
      const POINTS_PER_COURSE = 100;
      await this.prisma.userPoints.upsert({
        where: { userId },
        create: { userId, points: POINTS_PER_COURSE },
        update: { points: { increment: POINTS_PER_COURSE } },
      });

      // Check and award badges
      const userPoints = await this.prisma.userPoints.findUnique({ where: { userId } });
      if (userPoints) {
        const badges = await this.prisma.badge.findMany({
          where: { pointsRequired: { lte: userPoints.points } },
        });
        for (const badge of badges) {
          await this.prisma.userBadge.upsert({
            where: { userId_badgeId: { userId, badgeId: badge.id } },
            create: { userId, badgeId: badge.id },
            update: {},
          });
        }
      }
    }

    return enrollment;
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

  async assignToTeam(managerId: string, courseId: string) {
    const team = await this.prisma.user.findMany({
      where: { managerId, isActive: true },
    });
    return Promise.all(team.map(u => this.enroll(u.id, courseId)));
  }
}