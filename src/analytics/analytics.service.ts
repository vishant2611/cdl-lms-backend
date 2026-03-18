import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getCompanyStats() {
    const [totalUsers, totalCourses, totalEnrollments, completedEnrollments, totalCertificates] =
      await Promise.all([
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.course.count({ where: { isPublished: true } }),
        this.prisma.enrollment.count(),
        this.prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
        this.prisma.certificate.count(),
      ]);

    const completionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

    return { totalUsers, totalCourses, totalEnrollments, completedEnrollments, completionRate, totalCertificates };
  }

  async getDepartmentStats() {
    const departments = await this.prisma.department.findMany({
      include: {
        users: {
          where: { isActive: true },
          include: { enrollments: { select: { status: true } } },
        },
      },
    });

    return departments.map(dept => {
      const totalEnrollments = dept.users.flatMap(u => u.enrollments).length;
      const completed = dept.users.flatMap(u => u.enrollments).filter(e => e.status === 'COMPLETED').length;
      return {
        id: dept.id,
        name: dept.name,
        totalUsers: dept.users.length,
        totalEnrollments,
        completedEnrollments: completed,
        completionRate: totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0,
      };
    });
  }

  async getCourseStats() {
    return this.prisma.course.findMany({
      where: { isPublished: true },
      include: {
        _count: { select: { enrollments: true, certificates: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getManagerStats(managerId: string) {
    const team = await this.prisma.user.findMany({
      where: { managerId, isActive: true },
      include: {
        enrollments: { select: { status: true, progressPct: true, course: { select: { title: true } } } },
        certificates: true,
        userPoints: true,
      },
    });
    return team.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      totalEnrollments: u.enrollments.length,
      completed: u.enrollments.filter(e => e.status === 'COMPLETED').length,
      inProgress: u.enrollments.filter(e => e.status === 'IN_PROGRESS').length,
      certificates: u.certificates.length,
      points: u.userPoints?.points ?? 0,
    }));
  }
}