import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateCollegeAdminDto {
  username: string;
  password: string;
}

export interface CollegeAdminResponseDto {
  id: string;
  username: string;
  createdAt: Date;
  isActive: boolean;
}

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listCollegeAdmins(): Promise<CollegeAdminResponseDto[]> {
    const admins = await this.prisma.user.findMany({
      where: { role: 'COLLEGE_ADMIN' },
      select: {
        id: true,
        username: true,
        createdAt: true,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return admins.map((admin) => ({
      id: admin.id,
      username: admin.username ?? '',
      createdAt: admin.createdAt,
      isActive: admin.isActive,
    }));
  }

  async createCollegeAdmin(
    dto: CreateCollegeAdminDto,
  ): Promise<CollegeAdminResponseDto> {
    // Check for duplicate username
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existing) {
      throw new ConflictException(
        `Username "${dto.username}" is already taken.`,
      );
    }

    // Create the College Admin user record
    // email is required by schema — use username@collegeadmin.local as a placeholder
    const newAdmin = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: `${dto.username}@collegeadmin.local`,
        passwordHash: dto.password, // plain text for now
        firstName: dto.username,
        lastName: 'Admin',
        role: 'COLLEGE_ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        isActive: true,
      },
    });

    return {
      id: newAdmin.id,
      username: newAdmin.username ?? dto.username,
      createdAt: newAdmin.createdAt,
      isActive: newAdmin.isActive,
    };
  }
}
