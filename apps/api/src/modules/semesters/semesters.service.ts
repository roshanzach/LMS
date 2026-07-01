import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SemestersService {
  constructor(private readonly prisma: PrismaService) {}

  async listSemestersByScheme(schemeId: string) {
    const scheme = await this.prisma.scheme.findFirst({
      where: { id: schemeId, deletedAt: null },
    });
    if (!scheme) {
      throw new NotFoundException(`Scheme with ID ${schemeId} not found`);
    }

    return this.prisma.semester.findMany({
      where: { schemeId },
      orderBy: { semesterNumber: 'asc' },
    });
  }
}
