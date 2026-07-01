import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const SUPER_ADMIN_USERNAME = 'admin';
const SUPER_ADMIN_PASSWORD = 'Admin@123';

export interface LoginResponseDto {
  role: string;
  username: string;
  message: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaultData();
  }

  private async seedDefaultData() {
    try {
      // 1. Seed Super Admin User
      const superAdmin = await this.prisma.user.findUnique({
        where: { username: SUPER_ADMIN_USERNAME },
      });
      if (!superAdmin) {
        await this.prisma.user.create({
          data: {
            username: SUPER_ADMIN_USERNAME,
            email: 'admin@lms.local',
            passwordHash: SUPER_ADMIN_PASSWORD,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'SUPER_ADMIN',
            isActive: true,
          },
        });
        console.log(`[Seed] Created default super admin user.`);
      }

      // 2. Remove old test College Admin if it exists
      await this.prisma.user.delete({
        where: { username: 'college_admin' },
      }).catch(() => {});

      // 3. Seed new default College Admin User
      const collegeAdminUsername = 'cekadmin';
      const collegeAdmin = await this.prisma.user.findUnique({
        where: { username: collegeAdminUsername },
      });
      if (!collegeAdmin) {
        await this.prisma.user.create({
          data: {
            username: collegeAdminUsername,
            email: 'cekadmin@lms.local',
            passwordHash: '123456',
            firstName: 'College',
            lastName: 'Admin',
            role: 'COLLEGE_ADMIN',
            isActive: true,
            collegeId: null,
          },
        });
        console.log(`[Seed] Created default college admin user: ${collegeAdminUsername}`);
      }
    } catch (error) {
      console.error('[Seed] Error seeding default data:', error);
    }
  }

  async login(username: string, password: string): Promise<LoginResponseDto> {
    // 1. Hardcoded Super Admin check (never hits the database, fallback safety)
    if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
      return {
        role: 'SUPER_ADMIN',
        username: SUPER_ADMIN_USERNAME,
        message: 'Login successful',
      };
    }

    // 2. Look up College Admin (or other roles) by username in the DB
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Plain-text password comparison
    if (user.passwordHash !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      role: user.role,
      username: user.username ?? username,
      message: 'Login successful',
    };
  }
}
