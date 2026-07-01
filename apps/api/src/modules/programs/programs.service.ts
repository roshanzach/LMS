import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DegreeType } from '@prisma/client';

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPrograms(departmentId?: string) {
    let whereClause: any = { deletedAt: null };
    if (departmentId) {
      whereClause.departmentId = departmentId;
    }
    return this.prisma.program.findMany({
      where: whereClause,
      include: {
        department: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProgram(id: string) {
    const program = await this.prisma.program.findFirst({
      where: { id, deletedAt: null },
      include: {
        department: true,
      },
    });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }
    return program;
  }

  async createProgram(data: {
    name: string;
    code: string;
    degreeType: DegreeType;
    duration: number;
    departmentId: string;
  }) {
    const dept = await this.prisma.department.findFirst({
      where: { id: data.departmentId, deletedAt: null },
    });
    if (!dept) {
      throw new BadRequestException(`Department with ID ${data.departmentId} not found`);
    }

    let totalSemesters = data.duration * 2;
    if (data.degreeType === 'BTECH') {
      totalSemesters = 8;
    } else if (data.degreeType === 'MTECH' || data.degreeType === 'MCA') {
      totalSemesters = 4;
    }

    const existing = await this.prisma.program.findFirst({
      where: {
        departmentId: data.departmentId,
        code: data.code.toUpperCase(),
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException(`Program with code "${data.code}" already exists in this department.`);
    }

    return this.prisma.program.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        degreeType: data.degreeType,
        duration: data.duration,
        totalSemesters,
        departmentId: data.departmentId,
        isActive: true,
      },
    });
  }

  async updateProgram(
    id: string,
    data: {
      name?: string;
      code?: string;
      degreeType?: DegreeType;
      duration?: number;
      isActive?: boolean;
    },
  ) {
    const program = await this.prisma.program.findFirst({
      where: { id, deletedAt: null },
    });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    const updatedData: any = {};
    if (data.name !== undefined) updatedData.name = data.name;
    if (data.isActive !== undefined) updatedData.isActive = data.isActive;

    if (data.code !== undefined) {
      const codeUpper = data.code.toUpperCase();
      if (codeUpper !== program.code) {
        const existing = await this.prisma.program.findFirst({
          where: {
            departmentId: program.departmentId,
            code: codeUpper,
            deletedAt: null,
            id: { not: id },
          },
        });
        if (existing) {
          throw new BadRequestException(`Program with code "${data.code}" already exists in this department.`);
        }
      }
      updatedData.code = codeUpper;
    }

    if (data.duration || data.degreeType) {
      const finalDuration = data.duration ?? program.duration;
      const finalDegreeType = data.degreeType ?? program.degreeType;
      
      let totalSemesters = finalDuration * 2;
      if (finalDegreeType === 'BTECH') {
        totalSemesters = 8;
      } else if (finalDegreeType === 'MTECH' || finalDegreeType === 'MCA') {
        totalSemesters = 4;
      }
      
      updatedData.totalSemesters = totalSemesters;
      updatedData.duration = finalDuration;
      updatedData.degreeType = finalDegreeType;
    }

    return this.prisma.program.update({
      where: { id },
      data: updatedData,
    });
  }

  async softDeleteProgram(id: string) {
    const program = await this.prisma.program.findFirst({
      where: { id, deletedAt: null },
    });
    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return this.prisma.program.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
