import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CollegeAdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const role = request.headers['x-user-role'];
    const username = request.headers['x-username'];
    
    if (role !== 'COLLEGE_ADMIN') {
      throw new ForbiddenException('Only College Admins are authorized to access this resource.');
    }

    if (!username) {
      throw new ForbiddenException('Username header is required for College Admin access.');
    }

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.role !== 'COLLEGE_ADMIN') {
      throw new ForbiddenException('Unauthorized or invalid user role.');
    }

    let collegeId = user.collegeId;
    if (!collegeId) {
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
    }

    request.collegeId = collegeId;
    return true;
  }
}

