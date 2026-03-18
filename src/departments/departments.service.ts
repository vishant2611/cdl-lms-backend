import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        _count: { select: { users: true } },
      },
    });
  }

  async findOne(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: {
        users: {
          where: { isActive: true },
          select: { id: true, name: true, email: true, role: true },
        },
        _count: { select: { users: true } },
      },
    });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(name: string) {
    return this.prisma.department.create({ data: { name } });
  }

  async update(id: string, name: string) {
    return this.prisma.department.update({ where: { id }, data: { name } });
  }

  async remove(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}