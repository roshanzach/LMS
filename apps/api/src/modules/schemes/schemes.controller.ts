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
import { SchemesService } from './schemes.service';
import { CollegeAdminGuard } from '../../common/guards/college-admin.guard';
import { CurrentCollege } from '../../common/decorators/current-college.decorator';

class CreateSchemeDto {
  name: string;
  university: string;
  effectiveYear: number;
  programId: string;
}

class UpdateSchemeDto {
  name?: string;
  university?: string;
  effectiveYear?: number;
  isActive?: boolean;
  deletedAt?: Date | null;
}

@Controller('college-admin/schemes')
@UseGuards(CollegeAdminGuard)
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  @Get()
  async list(@Query('programId') programId?: string, @CurrentCollege() collegeId?: string) {
    return this.schemesService.listSchemes(programId, collegeId);
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentCollege() collegeId?: string) {
    return this.schemesService.getScheme(id, collegeId);
  }

  @Get(':id/semesters')
  async getSemesters(@Param('id') id: string, @CurrentCollege() collegeId?: string) {
    const scheme = await this.schemesService.getScheme(id, collegeId);
    return scheme.semesters;
  }

  @Post()
  async create(@Body() body: CreateSchemeDto, @CurrentCollege() collegeId?: string) {
    if (!body.name || !body.university || !body.effectiveYear || !body.programId) {
      throw new BadRequestException('All fields (name, university, effectiveYear, programId) are required');
    }
    return this.schemesService.createScheme(body, collegeId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateSchemeDto, @CurrentCollege() collegeId?: string) {
    return this.schemesService.updateScheme(id, body, collegeId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentCollege() collegeId?: string) {
    return this.schemesService.softDeleteScheme(id, collegeId);
  }
}
