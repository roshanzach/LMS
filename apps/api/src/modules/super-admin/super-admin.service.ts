import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateCollegeAdminDto {
  username: string;
  password: string;
  collegeName?: string;
  collegeCode?: string;
}

export interface CollegeAdminResponseDto {
  id: string;
  username: string;
  createdAt: Date;
  isActive: boolean;
  collegeName?: string;
  collegeCode?: string;
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
        college: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return admins.map((admin) => ({
      id: admin.id,
      username: admin.username ?? '',
      createdAt: admin.createdAt,
      isActive: admin.isActive,
      collegeName: admin.college?.name ?? '—',
      collegeCode: admin.college?.code ?? '—',
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

    // Provision a unique College for this College Admin
    const cleanUsername = dto.username.trim();
    const defaultCollegeName = dto.collegeName && dto.collegeName.trim() ? dto.collegeName.trim() : `${cleanUsername} College`;
    const defaultCollegeCode = dto.collegeCode && dto.collegeCode.trim() 
      ? dto.collegeCode.trim().toUpperCase() 
      : `${cleanUsername.toUpperCase()}-COL-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check if college code is taken, append random if needed
    let finalCollegeCode = defaultCollegeCode;
    const existingCollege = await this.prisma.college.findUnique({
      where: { code: finalCollegeCode },
    });
    if (existingCollege) {
      finalCollegeCode = `${defaultCollegeCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newCollege = await this.prisma.college.create({
      data: {
        name: defaultCollegeName,
        code: finalCollegeCode,
        createdBy: 'SUPER_ADMIN',
      },
    });

    // Create the College Admin user record attached to the new college
    const newAdmin = await this.prisma.user.create({
      data: {
        username: cleanUsername,
        email: `${cleanUsername}@collegeadmin.local`,
        passwordHash: dto.password, // plain text for now
        firstName: cleanUsername,
        lastName: 'Admin',
        role: 'COLLEGE_ADMIN',
        isActive: true,
        collegeId: newCollege.id,
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
      username: newAdmin.username ?? cleanUsername,
      createdAt: newAdmin.createdAt,
      isActive: newAdmin.isActive,
      collegeName: newCollege.name,
      collegeCode: newCollege.code,
    };
  }
}
