import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listDepartments(collegeId?: string) {
    let whereClause: any = { deletedAt: null };
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    return this.prisma.department.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
  }

  async getDepartment(id: string) {
    const dept = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });
    if (!dept) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }
    return dept;
  }

  async createDepartment(data: { name: string; code: string; collegeId: string }) {
    const college = await this.prisma.college.findUnique({
      where: { id: data.collegeId },
    });
    if (!college) {
      throw new BadRequestException(`College with ID ${data.collegeId} not found`);
    }

    const existing = await this.prisma.department.findFirst({
      where: {
        collegeId: data.collegeId,
        code: data.code.toUpperCase(),
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException(`Department with code "${data.code}" already exists in this College.`);
    }

    return this.prisma.department.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        collegeId: data.collegeId,
      },
    });
  }

  async updateDepartment(
    id: string,
    data: { name?: string; code?: string; deletedAt?: Date | null },
  ) {
    const dept = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });
    if (!dept) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.deletedAt !== undefined) updatePayload.deletedAt = data.deletedAt;

    if (data.code !== undefined) {
      const codeUpper = data.code.toUpperCase();
      if (codeUpper !== dept.code) {
        const existing = await this.prisma.department.findFirst({
          where: {
            collegeId: dept.collegeId,
            code: codeUpper,
            deletedAt: null,
            id: { not: id },
          },
        });
        if (existing) {
          throw new BadRequestException(`Department with code "${data.code}" already exists in this College.`);
        }
      }
      updatePayload.code = codeUpper;
    }

    return this.prisma.department.update({
      where: { id },
      data: updatePayload,
    });
  }

  async softDeleteDepartment(id: string) {
    const dept = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });
    if (!dept) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async createTestCollege() {
    // Create/Upsert the College record on-demand when requested by the frontend initialization flow
    return this.prisma.college.upsert({
      where: { code: 'KTU001' },
      update: {},
      create: {
        name: 'KTU affiliated Engineering College',
        code: 'KTU001',
      },
    });
  }
}
