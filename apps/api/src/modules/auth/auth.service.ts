import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const SUPER_ADMIN_USERNAME = 'admin';
const SUPER_ADMIN_PASSWORD = 'Admin@123';

export interface LoginResponseDto {
  role: string;
  username: string;
  message: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(username: string, password: string): Promise<LoginResponseDto> {
    // 1. Hardcoded Super Admin check (never hits the database)
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

    // Plain-text password comparison (as requested; upgrade to bcrypt later)
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
