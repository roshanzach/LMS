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
import { DepartmentsService } from './departments.service';
import { CollegeAdminGuard } from '../../common/guards/college-admin.guard';
import { CurrentCollege } from '../../common/decorators/current-college.decorator';

class CreateDepartmentDto {
  name: string;
  code: string;
}

class UpdateDepartmentDto {
  name?: string;
  code?: string;
  deletedAt?: string | null;
}

@Controller('college-admin/departments')
@UseGuards(CollegeAdminGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async list(@CurrentCollege() reqCollegeId: string | undefined, @Query('collegeId') queryCollegeId?: string) {
    const collegeId = reqCollegeId ?? queryCollegeId;
    return this.departmentsService.listDepartments(collegeId);
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentCollege() collegeId?: string) {
    return this.departmentsService.getDepartment(id, collegeId);
  }

  @Post()
  async create(@Body() body: CreateDepartmentDto, @CurrentCollege() reqCollegeId?: string) {
    if (!body.name || !body.code) {
      throw new BadRequestException('Fields (name, code) are required');
    }
    const collegeId = reqCollegeId;
    if (!collegeId) {
      throw new BadRequestException('collegeId is required from context');
    }
    return this.departmentsService.createDepartment({ ...body, collegeId });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateDepartmentDto, @CurrentCollege() collegeId?: string) {
    return this.departmentsService.updateDepartment(id, body, collegeId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentCollege() collegeId?: string) {
    return this.departmentsService.softDeleteDepartment(id, collegeId);
  }
}
