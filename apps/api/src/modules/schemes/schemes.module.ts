import { Module } from '@nestjs/common';
import { SchemesService } from './schemes.service';
import { SchemesController } from './schemes.controller';

@Module({
  providers: [SchemesService],
  controllers: [SchemesController],
  exports: [SchemesService],
})
export class SchemesModule {}
