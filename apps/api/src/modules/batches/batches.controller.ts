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
}

class UpdateBatchDto {
  name?: string;
  startYear?: number;
  endYear?: number;
  schemeId?: string;
  status?: BatchStatus;
  isActive?: boolean;
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
}
