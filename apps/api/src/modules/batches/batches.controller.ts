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
  async list(@Query('programId') programId?: string) {
    return this.batchesService.listBatches(programId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.batchesService.getBatch(id);
  }

  @Post()
  async create(@Body() body: CreateBatchDto) {
    if (!body.name || !body.startYear || !body.endYear || !body.programId || !body.schemeId) {
      throw new BadRequestException('All fields (name, startYear, endYear, programId, schemeId) are required');
    }
    return this.batchesService.createBatch(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateBatchDto) {
    return this.batchesService.updateBatch(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.batchesService.softDeleteBatch(id);
  }

  @Get(':id/semesters/:semNo/calendar')
  async listCalendar(
    @Param('id') batchId: string,
    @Param('semNo') semNo: string,
  ) {
    return this.batchesService.listCalendarEvents(batchId, parseInt(semNo));
  }

  @Post(':id/semesters/:semNo/calendar')
  async addCalendar(
    @Param('id') batchId: string,
    @Param('semNo') semNo: string,
    @Body() body: { title: string; date: string; type: string },
  ) {
    if (!body.title || !body.date || !body.type) {
      throw new BadRequestException('All fields (title, date, type) are required');
    }
    return this.batchesService.addCalendarEvent(batchId, parseInt(semNo), body);
  }

  @Delete('calendar/:calId')
  async deleteCalendar(@Param('calId') calId: string) {
    return this.batchesService.deleteCalendarEvent(calId);
  }
}
