import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async addPoints(userId: string, points: number) {
    return this.prisma.userPoints.upsert({
      where: { userId },
      create: { userId, points },
      update: { points: { increment: points } },
    });
  }

  async getLeaderboard(limit = 20) {
    return this.prisma.userPoints.findMany({
      take: limit,
      orderBy: { points: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, department: { select: { name: true } } },
        },
      },
    });
  }

  async getBadges() {
    return this.prisma.badge.findMany({ orderBy: { pointsRequired: 'asc' } });
  }

  async awardBadge(userId: string, badgeId: string) {
    return this.prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId } },
      create: { userId, badgeId },
      update: {},
    });
  }

  async checkAndAwardBadges(userId: string) {
    const userPoints = await this.prisma.userPoints.findUnique({ where: { userId } });
    if (!userPoints) return;
    const badges = await this.prisma.badge.findMany({
      where: { pointsRequired: { lte: userPoints.points } },
    });
    for (const badge of badges) {
      await this.awardBadge(userId, badge.id);
    }
  }

  async getUserPoints(userId: string) {
    return this.prisma.userPoints.findUnique({ where: { userId } });
  }
}