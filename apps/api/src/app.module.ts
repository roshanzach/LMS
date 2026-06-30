import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CollegesModule } from './modules/colleges/colleges.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ObeModule } from './modules/obe/obe.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { GradesModule } from './modules/grades/grades.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ForumsModule } from './modules/forums/forums.module';
import { LeaveModule } from './modules/leave/leave.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    PrismaModule,
    AuthModule,
    SuperAdminModule,
    CollegesModule,
    DepartmentsModule,
    CoursesModule,
    AttendanceModule,
    ObeModule,
    AiModule,
    NotificationsModule,
    UsersModule,
    AssignmentsModule,
    AssessmentsModule,
    GradesModule,
    ReportsModule,
    ForumsModule,
    LeaveModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
