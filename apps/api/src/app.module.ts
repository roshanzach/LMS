import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CollegesModule } from './modules/colleges/colleges.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { CoursesModule } from './modules/courses/courses.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ObeModule } from './modules/obe/obe.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    CollegesModule,
    DepartmentsModule,
    CoursesModule,
    AttendanceModule,
    ObeModule,
    AiModule,
    NotificationsModule,
  ],
})
export class AppModule {}
