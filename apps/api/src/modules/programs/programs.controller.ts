import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CollegeAdminGuard } from '../../common/guards/college-admin.guard';
import { CurrentCollege } from '../../common/decorators/current-college.decorator';
import { DegreeType } from '@prisma/client';

class CreateProgramDto {
  name: string;
  code: string;
  degreeType: DegreeType;
  duration: number;
  departmentId: string;
  totalSemesters?: number;
}

class UpdateProgramDto {
  name?: string;
  code?: string;
  degreeType?: DegreeType;
  duration?: number;
  isActive?: boolean;
  totalSemesters?: number;
}

@Controller('college-admin/programs')
@UseGuards(CollegeAdminGuard)
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  async list(@Query('departmentId') departmentId?: string, @CurrentCollege() collegeId?: string) {
    return this.programsService.listPrograms(departmentId, collegeId);
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentCollege() collegeId?: string) {
    return this.programsService.getProgram(id, collegeId);
  }

  @Post()
  async create(@Body() body: CreateProgramDto, @CurrentCollege() collegeId?: string) {
    if (!body.name || !body.code || !body.degreeType || !body.duration || !body.departmentId) {
      throw new BadRequestException('All fields (name, code, degreeType, duration, departmentId) are required');
    }
    return this.programsService.createProgram(body, collegeId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateProgramDto, @CurrentCollege() collegeId?: string) {
    return this.programsService.updateProgram(id, body, collegeId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentCollege() collegeId?: string) {
    return this.programsService.softDeleteProgram(id, collegeId);
  }
}
