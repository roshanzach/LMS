import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { SuperAdminService, CreateCollegeAdminDto } from './super-admin.service';

@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // GET /api/super-admin/college-admins
  @Get('college-admins')
  async listCollegeAdmins() {
    return this.superAdminService.listCollegeAdmins();
  }

  // POST /api/super-admin/college-admins
  @Post('college-admins')
  @HttpCode(HttpStatus.CREATED)
  async createCollegeAdmin(@Body() body: CreateCollegeAdminDto) {
    if (!body.username || !body.password) {
      throw new BadRequestException('Username and password are required');
    }
    return this.superAdminService.createCollegeAdmin(body);
  }
}
