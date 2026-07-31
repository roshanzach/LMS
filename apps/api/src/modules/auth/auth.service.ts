import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const SUPER_ADMIN_USERNAME = 'admin';
const SUPER_ADMIN_PASSWORD = 'Admin@123';

export interface LoginResponseDto {
  role: string;
  username: string;
  message: string;
  collegeId?: string;
  collegeName?: string;
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
            passwordHash: SUPER_ADMIN_PASSWORD, // Not hashed for the prototype
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
        const defaultCollege = await this.prisma.college.upsert({
          where: { code: 'CEK-001' },
          update: {},
          create: {
            name: 'CEK Engineering College',
            code: 'CEK-001',
          },
        });

        await this.prisma.user.create({
          data: {
            username: collegeAdminUsername,
            email: 'cekadmin@lms.local',
            passwordHash: '123456', // Test password
            firstName: 'College',
            lastName: 'Admin',
            role: 'COLLEGE_ADMIN',
            isActive: true,
            collegeId: defaultCollege.id,
          },
        });
        console.log(`[Seed] Created default college admin user: ${collegeAdminUsername}`);
      }
    } catch (error) {
      console.error('[Seed] Error seeding default data:', error);
    }
  }

  async login(username: string, password: string): Promise<LoginResponseDto> {
    // 1. Hardcoded Super Admin check
    if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
      return {
        role: 'SUPER_ADMIN',
        username: SUPER_ADMIN_USERNAME,
        message: 'Login successful',
      };
    }

    // 2. Look up user by username in the DB
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
        isActive: true,
        collegeId: true,
        college: {
          select: { name: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Direct password match (since we're storing plaintext passwords for now)
    if (user.passwordHash !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let collegeId = user.collegeId ?? undefined;
    let collegeName = user.college?.name ?? undefined;

    // Auto-provision college if College Admin has none
    if (user.role === 'COLLEGE_ADMIN' && !collegeId) {
      const cleanName = user.username ? user.username.trim() : 'Admin';
      const newCollege = await this.prisma.college.create({
        data: {
          name: `${cleanName} College`,
          code: `${cleanName.toUpperCase()}-COL-${Math.floor(1000 + Math.random() * 9000)}`,
          createdBy: 'SYSTEM_AUTO',
        },
      });
      await this.prisma.user.update({
        where: { id: user.id },
        data: { collegeId: newCollege.id },
      });
      collegeId = newCollege.id;
      collegeName = newCollege.name;
    }

    return {
      role: user.role,
      username: user.username ?? username,
      message: 'Login successful',
      collegeId,
      collegeName,
    };
  }
}
