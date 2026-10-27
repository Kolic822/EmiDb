import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module.js';
import { ManufacturersController } from './manufacturers.controller.js';
import { ManufacturersService } from './manufacturers.service.js';

@Module({
  imports: [AttachmentsModule],
  controllers: [ManufacturersController],
  providers: [ManufacturersService],
  exports: [ManufacturersService],
})
export class ManufacturersModule {}
