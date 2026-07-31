import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listDepartments(collegeId?: string) {
    let whereClause: any = {};
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    return this.prisma.department.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { programs: true }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async getDepartment(id: string, collegeId?: string) {
    const whereClause: any = { id };
    if (collegeId) whereClause.collegeId = collegeId;
    
    const dept = await this.prisma.department.findFirst({
      where: whereClause,
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
    data: { name?: string; code?: string; deletedAt?: Date | string | null },
    collegeId?: string,
  ) {
    const whereClause: any = { id };
    if (collegeId) whereClause.collegeId = collegeId;

    const dept = await this.prisma.department.findFirst({
      where: whereClause,
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

  async softDeleteDepartment(id: string, collegeId?: string) {
    const whereClause: any = { id, deletedAt: null };
    if (collegeId) whereClause.collegeId = collegeId;

    const dept = await this.prisma.department.findFirst({
      where: whereClause,
    });
    if (!dept) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return this.prisma.department.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
