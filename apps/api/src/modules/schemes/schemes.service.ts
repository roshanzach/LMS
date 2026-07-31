import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchemesService {
  constructor(private readonly prisma: PrismaService) {}

  async listSchemes(programId?: string, collegeId?: string) {
    let whereClause: any = {};
    if (programId) {
      whereClause.programId = programId;
    }
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    return this.prisma.scheme.findMany({
      where: whereClause,
      include: {
        program: {
          include: {
            department: true,
          },
        },
        semesters: {
          include: {
            courses: { where: { deletedAt: null } }
          },
          orderBy: { semesterNumber: 'asc' }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getScheme(id: string, collegeId?: string) {
    let whereClause: any = { id, deletedAt: null };
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    const scheme = await this.prisma.scheme.findFirst({
      where: whereClause,
      include: {
        program: true,
        semesters: {
          include: {
            courses: { where: { deletedAt: null } }
          },
          orderBy: { semesterNumber: 'asc' }
        },
      },
    });
    if (!scheme) {
      throw new NotFoundException(`Scheme with ID ${id} not found`);
    }
    return scheme;
  }

  async createScheme(data: {
    name: string;
    university: string;
    effectiveYear: number;
    programId: string;
  }, collegeId?: string) {
    let programWhere: any = { id: data.programId, deletedAt: null };
    if (collegeId) {
      programWhere.collegeId = collegeId;
    }
    const program = await this.prisma.program.findFirst({
      where: programWhere,
    });
    if (!program) {
      throw new BadRequestException(`Program with ID ${data.programId} not found`);
    }

    const existing = await this.prisma.scheme.findFirst({
      where: {
        programId: data.programId,
        name: data.name.trim(),
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException(`Scheme with name "${data.name}" already exists for this Program.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const scheme = await tx.scheme.create({
        data: {
          name: data.name.trim(),
          university: data.university.trim(),
          effectiveYear: data.effectiveYear,
          programId: data.programId,
          collegeId: program.collegeId || collegeId,
          isActive: true,
        },
      });

      const semestersData = Array.from({ length: program.totalSemesters }, (_, i) => ({
        semesterNumber: i + 1,
        name: `Semester ${i + 1}`,
        schemeId: scheme.id,
      }));

      await tx.semester.createMany({
        data: semestersData,
      });

      return scheme;
    });
  }

  async updateScheme(
    id: string,
    data: {
      name?: string;
      university?: string;
      effectiveYear?: number;
      isActive?: boolean;
      deletedAt?: Date | null;
    },
    collegeId?: string,
  ) {
    let whereClause: any = { id };
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    const scheme = await this.prisma.scheme.findFirst({
      where: whereClause,
      include: { program: true },
    });
    if (!scheme) {
      throw new NotFoundException(`Scheme with ID ${id} not found`);
    }

    const updatePayload: any = {};
    if (data.university !== undefined) updatePayload.university = data.university.trim();
    if (data.effectiveYear !== undefined) updatePayload.effectiveYear = data.effectiveYear;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
    if (data.deletedAt !== undefined) updatePayload.deletedAt = data.deletedAt;

    if (data.name !== undefined) {
      const nameTrimmed = data.name.trim();
      if (nameTrimmed !== scheme.name) {
        const existing = await this.prisma.scheme.findFirst({
          where: {
            programId: scheme.programId,
            name: nameTrimmed,
            deletedAt: null,
            id: { not: id },
          },
        });
        if (existing) {
          throw new BadRequestException(`Scheme with name "${data.name}" already exists for this Program.`);
        }
      }
      updatePayload.name = nameTrimmed;
    }

    return this.prisma.scheme.update({
      where: { id },
      data: updatePayload,
    });
  }

  async softDeleteScheme(id: string, collegeId?: string) {
    let whereClause: any = { id, deletedAt: null };
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    const scheme = await this.prisma.scheme.findFirst({
      where: whereClause,
    });
    if (!scheme) {
      throw new NotFoundException(`Scheme with ID ${id} not found`);
    }

    return this.prisma.scheme.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
