import { Module } from '@nestjs/common';
import { SemestersService } from './semesters.service';
import { SemestersController } from './semesters.controller';

@Module({
  providers: [SemestersService],
  controllers: [SemestersController],
  exports: [SemestersService],
})
export class SemestersModule {}
