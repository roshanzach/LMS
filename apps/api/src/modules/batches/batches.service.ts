import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BatchStatus } from '@prisma/client';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async listBatches(programId?: string, collegeId?: string) {
    let whereClause: any = { deletedAt: null };
    if (programId) {
      whereClause.programId = programId;
    }
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    return this.prisma.batch.findMany({
      where: whereClause,
      include: {
        program: {
          include: {
            department: true,
          },
        },
        scheme: true,
      },
      orderBy: { startYear: 'desc' },
    });
  }

  async getBatch(id: string, collegeId?: string) {
    let whereClause: any = { id, deletedAt: null };
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    const batch = await this.prisma.batch.findFirst({
      where: whereClause,
      include: {
        program: true,
        scheme: true,
      },
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async createBatch(data: {
    name: string;
    startYear: number;
    endYear: number;
    programId: string;
    schemeId: string;
    classroom?: string;
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

    const scheme = await this.prisma.scheme.findFirst({
      where: { id: data.schemeId, deletedAt: null },
    });
    if (!scheme) {
      throw new BadRequestException(`Scheme with ID ${data.schemeId} not found`);
    }

    if (scheme.programId !== data.programId) {
      throw new BadRequestException(`Scheme "${scheme.name}" does not belong to the selected Program.`);
    }

    const existing = await this.prisma.batch.findFirst({
      where: {
        programId: data.programId,
        startYear: data.startYear,
        name: data.name,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException(`A Batch named "${data.name}" already exists starting in ${data.startYear} for this Program.`);
    }

    return this.prisma.batch.create({
      data: {
        name: data.name,
        startYear: data.startYear,
        endYear: data.endYear,
        programId: data.programId,
        schemeId: data.schemeId,
        classroom: data.classroom,
        collegeId: program.collegeId || collegeId,
        status: BatchStatus.ACTIVE,
        isActive: true,
      },
    });
  }

  async updateBatch(
    id: string,
    data: {
      name?: string;
      startYear?: number;
      endYear?: number;
      schemeId?: string;
      status?: BatchStatus;
      isActive?: boolean;
      classroom?: string;
    },
    collegeId?: string,
  ) {
    let whereClause: any = { id, deletedAt: null };
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    const batch = await this.prisma.batch.findFirst({
      where: whereClause,
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.startYear !== undefined) updatePayload.startYear = data.startYear;
    if (data.endYear !== undefined) updatePayload.endYear = data.endYear;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
    if (data.classroom !== undefined) updatePayload.classroom = data.classroom;

    if (data.schemeId !== undefined) {
      const scheme = await this.prisma.scheme.findFirst({
        where: { id: data.schemeId, deletedAt: null },
      });
      if (!scheme) {
        throw new BadRequestException(`Scheme with ID ${data.schemeId} not found`);
      }
      if (scheme.programId !== batch.programId) {
        throw new BadRequestException(`Scheme "${scheme.name}" does not belong to the batch's Program.`);
      }
      updatePayload.schemeId = data.schemeId;
    }

    return this.prisma.batch.update({
      where: { id },
      data: updatePayload,
    });
  }

  async softDeleteBatch(id: string, collegeId?: string) {
    let whereClause: any = { id, deletedAt: null };
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    const batch = await this.prisma.batch.findFirst({
      where: whereClause,
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return this.prisma.batch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async listCalendarEvents(batchId: string, semesterNumber: number, collegeId?: string) {
    let whereClause: any = { batchId, semesterNumber };
    if (collegeId) {
      whereClause.batch = { collegeId };
    }
    return this.prisma.academicCalendar.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });
  }

  async addCalendarEvent(
    batchId: string,
    semesterNumber: number,
    data: { title: string; date: string; type: string },
    collegeId?: string,
  ) {
    let whereClause: any = { id: batchId, deletedAt: null };
    if (collegeId) {
      whereClause.collegeId = collegeId;
    }
    const batch = await this.prisma.batch.findFirst({
      where: whereClause,
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${batchId} not found`);
    }
    return this.prisma.academicCalendar.create({
      data: {
        batchId,
        semesterNumber,
        title: data.title,
        date: data.date,
        type: data.type,
      },
    });
  }

  async deleteCalendarEvent(id: string, collegeId?: string) {
    let whereClause: any = { id };
    if (collegeId) {
      whereClause.batch = { collegeId };
    }
    const ev = await this.prisma.academicCalendar.findFirst({
      where: whereClause,
    });
    if (!ev) {
      throw new NotFoundException(`Calendar Event with ID ${id} not found`);
    }
    return this.prisma.academicCalendar.delete({
      where: { id },
    });
  }

  async bulkCreateBatches(data: {
    name: string;
    startYear: number;
    endYear: number;
    status?: BatchStatus;
    programs: {
      programId: string;
      schemeId: string;
      differentiators: string[];
    }[];
  }, collegeId?: string) {
    const batchesToCreate = [];
    let count = 0;

    for (const progData of data.programs) {
      let programWhere: any = { id: progData.programId, deletedAt: null };
      if (collegeId) {
        programWhere.collegeId = collegeId;
      }
      const program = await this.prisma.program.findFirst({
        where: programWhere,
      });
      if (!program) {
        throw new BadRequestException(`Program with ID ${progData.programId} not found`);
      }

      const scheme = await this.prisma.scheme.findFirst({
        where: { id: progData.schemeId, deletedAt: null },
      });
      if (!scheme) {
        throw new BadRequestException(`Scheme with ID ${progData.schemeId} not found`);
      }

      if (scheme.programId !== progData.programId) {
        throw new BadRequestException(`Scheme "${scheme.name}" does not belong to the Program ${program.name}.`);
      }

      for (const diff of progData.differentiators) {
        const finalName = `${data.name} | ${program.code.split('-').pop() || program.code} | ${diff}`;
        
        const existing = await this.prisma.batch.findFirst({
          where: {
            programId: progData.programId,
            startYear: data.startYear,
            name: finalName,
            deletedAt: null,
          },
        });
        
        if (existing) {
          throw new BadRequestException(`A Batch named "${finalName}" already exists starting in ${data.startYear} for Program ${program.name}.`);
        }

        batchesToCreate.push({
          name: finalName,
          startYear: data.startYear,
          endYear: data.endYear,
          programId: progData.programId,
          schemeId: progData.schemeId,
          classroom: diff,
          collegeId: program.collegeId || collegeId,
          status: data.status || BatchStatus.ACTIVE,
          isActive: true,
        });
        count++;
      }
    }

    await this.prisma.batch.createMany({
      data: batchesToCreate,
    });

    return { count };
  }
}
