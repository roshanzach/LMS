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
}

@Controller('college-admin/schemes')
@UseGuards(CollegeAdminGuard)
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  @Get()
  async list(@Query('programId') programId?: string) {
    return this.schemesService.listSchemes(programId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.schemesService.getScheme(id);
  }

  @Post()
  async create(@Body() body: CreateSchemeDto) {
    if (!body.name || !body.university || !body.effectiveYear || !body.programId) {
      throw new BadRequestException('All fields (name, university, effectiveYear, programId) are required');
    }
    return this.schemesService.createScheme(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateSchemeDto) {
    return this.schemesService.updateScheme(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.schemesService.softDeleteScheme(id);
  }
}
