import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module.js';
import { PotLayoutsController } from './pot-layouts.controller.js';
import { PotLayoutsService } from './pot-layouts.service.js';

@Module({
  imports: [AttachmentsModule],
  controllers: [PotLayoutsController],
  providers: [PotLayoutsService],
  exports: [PotLayoutsService],
})
export class PotLayoutsModule {}
