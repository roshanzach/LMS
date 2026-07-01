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

class CreateDepartmentDto {
  name: string;
  code: string;
  collegeId: string;
}

class UpdateDepartmentDto {
  name?: string;
  code?: string;
}

@Controller('college-admin/departments')
@UseGuards(CollegeAdminGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async list(@Query('collegeId') collegeId?: string) {
    return this.departmentsService.listDepartments(collegeId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.departmentsService.getDepartment(id);
  }

  @Post()
  async create(@Body() body: CreateDepartmentDto) {
    if (!body.name || !body.code || !body.collegeId) {
      throw new BadRequestException('All fields (name, code, collegeId) are required');
    }
    return this.departmentsService.createDepartment(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateDepartmentDto) {
    return this.departmentsService.updateDepartment(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.departmentsService.softDeleteDepartment(id);
  }

  @Post('test-setup')
  async testSetup() {
    return this.departmentsService.createTestCollege();
  }
}
