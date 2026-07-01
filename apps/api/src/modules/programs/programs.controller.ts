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
import { DegreeType } from '@prisma/client';

class CreateProgramDto {
  name: string;
  code: string;
  degreeType: DegreeType;
  duration: number;
  departmentId: string;
}

class UpdateProgramDto {
  name?: string;
  code?: string;
  degreeType?: DegreeType;
  duration?: number;
  isActive?: boolean;
}

@Controller('college-admin/programs')
@UseGuards(CollegeAdminGuard)
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Get()
  async list(@Query('departmentId') departmentId?: string) {
    return this.programsService.listPrograms(departmentId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.programsService.getProgram(id);
  }

  @Post()
  async create(@Body() body: CreateProgramDto) {
    if (!body.name || !body.code || !body.degreeType || !body.duration || !body.departmentId) {
      throw new BadRequestException('All fields (name, code, degreeType, duration, departmentId) are required');
    }
    return this.programsService.createProgram(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateProgramDto) {
    return this.programsService.updateProgram(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.programsService.softDeleteProgram(id);
  }
}
