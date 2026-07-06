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
import { BatchesService } from './batches.service';
import { CollegeAdminGuard } from '../../common/guards/college-admin.guard';
import { CurrentCollege } from '../../common/decorators/current-college.decorator';
import { BatchStatus } from '@prisma/client';

class CreateBatchDto {
  name: string;
  startYear: number;
  endYear: number;
  programId: string;
  schemeId: string;
  classroom?: string;
}

class UpdateBatchDto {
  name?: string;
  startYear?: number;
  endYear?: number;
  schemeId?: string;
  status?: BatchStatus;
  isActive?: boolean;
  classroom?: string;
}

@Controller('college-admin/batches')
@UseGuards(CollegeAdminGuard)
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  async list(@Query('programId') programId?: string, @CurrentCollege() collegeId?: string) {
    return this.batchesService.listBatches(programId, collegeId);
  }

  @Get(':id')
  async get(@Param('id') id: string, @CurrentCollege() collegeId?: string) {
    return this.batchesService.getBatch(id, collegeId);
  }

  @Post()
  async create(@Body() body: CreateBatchDto, @CurrentCollege() collegeId?: string) {
    if (!body.name || !body.startYear || !body.endYear || !body.programId || !body.schemeId) {
      throw new BadRequestException('All fields (name, startYear, endYear, programId, schemeId) are required');
    }
    return this.batchesService.createBatch(body, collegeId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateBatchDto, @CurrentCollege() collegeId?: string) {
    return this.batchesService.updateBatch(id, body, collegeId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentCollege() collegeId?: string) {
    return this.batchesService.softDeleteBatch(id, collegeId);
  }

  @Get(':id/semesters/:semNo/calendar')
  async listCalendar(
    @Param('id') batchId: string,
    @Param('semNo') semNo: string,
    @CurrentCollege() collegeId?: string
  ) {
    return this.batchesService.listCalendarEvents(batchId, parseInt(semNo), collegeId);
  }

  @Post(':id/semesters/:semNo/calendar')
  async addCalendar(
    @Param('id') batchId: string,
    @Param('semNo') semNo: string,
    @Body() body: { title: string; date: string; type: string },
    @CurrentCollege() collegeId?: string
  ) {
    if (!body.title || !body.date || !body.type) {
      throw new BadRequestException('All fields (title, date, type) are required');
    }
    return this.batchesService.addCalendarEvent(batchId, parseInt(semNo), body, collegeId);
  }

  @Delete('calendar/:calId')
  async deleteCalendar(@Param('calId') calId: string, @CurrentCollege() collegeId?: string) {
    return this.batchesService.deleteCalendarEvent(calId, collegeId);
  }
}
