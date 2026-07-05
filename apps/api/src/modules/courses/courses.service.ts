import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CourseCategory } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourse(data: {
    name: string;
    code: string;
    credits: number;
    ltp?: string;
    category?: CourseCategory;
    description?: string;
    semesterId: string;
  }) {
    const semester = await this.prisma.semester.findUnique({
      where: { id: data.semesterId },
    });
    if (!semester) {
      throw new BadRequestException(`Semester with ID ${data.semesterId} not found`);
    }

    const codeUpper = data.code.toUpperCase();
    const existing = await this.prisma.course.findFirst({
      where: {
        semesterId: data.semesterId,
        code: codeUpper,
        deletedAt: null,
      },
    });
    if (existing) {
      throw new BadRequestException(`Course with code "${data.code}" already exists in this semester.`);
    }

    return this.prisma.course.create({
      data: {
        name: data.name.trim(),
        code: codeUpper,
        credits: data.credits,
        ltp: data.ltp || null,
        category: data.category || CourseCategory.CORE,
        description: data.description || null,
        semesterId: data.semesterId,
        isActive: true,
      },
    });
  }

  async deleteCourse(id: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, deletedAt: null },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
