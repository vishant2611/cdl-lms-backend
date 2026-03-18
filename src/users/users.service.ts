import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        department: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } },
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        department: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } },
        subordinates: { select: { id: true, name: true, email: true } },
        userPoints: true,
        userBadges: { include: { badge: true } },
        enrollments: {
          include: { course: { select: { id: true, title: true, type: true } } },
        },
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findTeam(managerId: string) {
    return this.prisma.user.findMany({
      where: { managerId, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        department: { select: { id: true, name: true } },
        enrollments: {
          select: {
            status: true,
            progressPct: true,
            course: { select: { id: true, title: true } },
          },
        },
        userPoints: true,
      },
    });
  }

  async update(id: string, data: {
    name?: string;
    email?: string;
    password?: string;
    role?: any;
    departmentId?: string;
    managerId?: string;
    avatarUrl?: string;
    isActive?: boolean;
  }) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        departmentId: true,
      },
    });
  }

  async deactivate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async bulkCreate(users: {
    name: string;
    email: string;
    password: string;
    role?: any;
    departmentId?: string;
  }[]) {
    const results: any[] = [];
    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 10);
      const user = await this.prisma.user.create({
        data: { ...u, password: hashed },
        select: { id: true, name: true, email: true, role: true },
      });
      results.push(user);
    }
    return results;
  }
}