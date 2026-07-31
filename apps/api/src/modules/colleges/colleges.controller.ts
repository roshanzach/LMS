import { Controller, Get, UseGuards, BadRequestException } from '@nestjs/common';
import { CollegesService } from './colleges.service';
import { CollegeAdminGuard } from '../../common/guards/college-admin.guard';
import { CurrentCollege } from '../../common/decorators/current-college.decorator';

@Controller('college-admin/dashboard-stats')
@UseGuards(CollegeAdminGuard)
export class CollegesController {
  constructor(private readonly collegesService: CollegesService) {}

  @Get()
  async getStats(@CurrentCollege() collegeId: string) {
    if (!collegeId) {
      throw new BadRequestException('collegeId is required from context');
    }
    return this.collegesService.getDashboardStats(collegeId);
  }
}
