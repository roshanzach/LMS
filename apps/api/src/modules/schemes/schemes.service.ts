import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchemesService {
  constructor(private readonly prisma: PrismaService) {}

  async listSchemes(programId?: string) {
    let whereClause: any = { deletedAt: null };
    if (programId) {
      whereClause.programId = programId;
    }
    return this.prisma.scheme.findMany({
      where: whereClause,
      include: {
        program: {
          include: {
            department: true,
          },
        },
        semesters: { orderBy: { semesterNumber: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getScheme(id: string) {
    const scheme = await this.prisma.scheme.findFirst({
      where: { id, deletedAt: null },
      include: {
        program: true,
        semesters: { orderBy: { semesterNumber: 'asc' } },
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
  }) {
    const program = await this.prisma.program.findFirst({
      where: { id: data.programId, deletedAt: null },
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
    },
  ) {
    const scheme = await this.prisma.scheme.findFirst({
      where: { id, deletedAt: null },
      include: { program: true },
    });
    if (!scheme) {
      throw new NotFoundException(`Scheme with ID ${id} not found`);
    }

    const updatePayload: any = {};
    if (data.university !== undefined) updatePayload.university = data.university.trim();
    if (data.effectiveYear !== undefined) updatePayload.effectiveYear = data.effectiveYear;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

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

  async softDeleteScheme(id: string) {
    const scheme = await this.prisma.scheme.findFirst({
      where: { id, deletedAt: null },
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
