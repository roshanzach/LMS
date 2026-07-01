import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SemestersService } from './semesters.service';
import { CollegeAdminGuard } from '../../common/guards/college-admin.guard';

@Controller('college-admin/schemes')
@UseGuards(CollegeAdminGuard)
export class SemestersController {
  constructor(private readonly semestersService: SemestersService) {}

  @Get(':id/semesters')
  async list(@Param('id') id: string) {
    return this.semestersService.listSemestersByScheme(id);
  }
}
