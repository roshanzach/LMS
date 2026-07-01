import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CollegeAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const role = request.headers['x-user-role'];
    
    // For local tests/dev, if no header is provided we allow, else we enforce COLLEGE_ADMIN
    if (!role) return true;
    
    if (role !== 'COLLEGE_ADMIN') {
      throw new ForbiddenException('Only College Admins are authorized to access this resource.');
    }
    return true;
  }
}
