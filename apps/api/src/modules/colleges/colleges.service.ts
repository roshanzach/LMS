import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CollegesService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(collegeId: string) {
    const [totalStudents, totalFaculty] = await Promise.all([
      this.prisma.studentProfile.count({ 
        where: { collegeId, deletedAt: null } 
      }),
      this.prisma.facultyProfile.count({ 
        where: { collegeId } 
      })
    ]);
    
    // Default avg attendance for now until attendance module is complete
    const avgAttendance = '0%';
    
    return {
      totalStudents,
      totalFaculty,
      avgAttendance
    };
  }
}
