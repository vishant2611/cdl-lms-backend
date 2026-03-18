import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  async getRules() {
    return this.prisma.complianceRule.findMany({
      include: {
        course: { select: { id: true, title: true } },
        department: { select: { id: true, name: true } },
      },
    });
  }

  async createRule(data: { courseId: string; departmentId?: string; deadline?: Date; isMandatory?: boolean }) {
    return this.prisma.complianceRule.create({ data });
  }

  async getMyCompliance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    });

    const rules = await this.prisma.complianceRule.findMany({
      where: {
        OR: [
          { departmentId: null },
          { departmentId: user?.departmentId ?? undefined },
        ],
      },
      include: { course: { select: { id: true, title: true } } },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true, status: true, completedAt: true },
    });

    return rules.map(rule => {
      const enrollment = enrollments.find(e => e.courseId === rule.courseId);
      const completed = enrollment?.status === 'COMPLETED';
      const overdue = rule.deadline && !completed && new Date() > new Date(rule.deadline);
      return {
        ...rule,
        status: completed ? 'COMPLETED' : overdue ? 'OVERDUE' : 'PENDING',
        completedAt: enrollment?.completedAt,
      };
    });
  }

  async deleteRule(id: string) {
    return this.prisma.complianceRule.delete({ where: { id } });
  }
}