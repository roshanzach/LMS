import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CollegeAdminGuard } from '../../common/guards/college-admin.guard';
import { CurrentCollege } from '../../common/decorators/current-college.decorator';
import { CourseCategory } from '@prisma/client';

class CreateCourseDto {
  name: string;
  code: string;
  credits: number;
  ltp?: string;
  category?: CourseCategory;
  description?: string;
  semesterId: string;
}

@Controller('college-admin/courses')
@UseGuards(CollegeAdminGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async create(@Body() body: CreateCourseDto, @CurrentCollege() collegeId?: string) {
    if (!body.name || !body.code || body.credits === undefined || !body.semesterId) {
      throw new BadRequestException('All fields (name, code, credits, semesterId) are required');
    }
    return this.coursesService.createCourse(body, collegeId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentCollege() collegeId?: string) {
    return this.coursesService.deleteCourse(id, collegeId);
  }
}
