import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BatchStatus } from '@prisma/client';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async listBatches(programId?: string) {
    let whereClause: any = { deletedAt: null };
    if (programId) {
      whereClause.programId = programId;
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

  async getBatch(id: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id, deletedAt: null },
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
  }) {
    const program = await this.prisma.program.findFirst({
      where: { id: data.programId, deletedAt: null },
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
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException(`A Batch already exists starting in ${data.startYear} for this Program.`);
    }

    return this.prisma.batch.create({
      data: {
        name: data.name,
        startYear: data.startYear,
        endYear: data.endYear,
        programId: data.programId,
        schemeId: data.schemeId,
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
    },
  ) {
    const batch = await this.prisma.batch.findFirst({
      where: { id, deletedAt: null },
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

  async softDeleteBatch(id: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id, deletedAt: null },
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return this.prisma.batch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
