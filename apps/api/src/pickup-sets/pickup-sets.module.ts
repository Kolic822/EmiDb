import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module.js';
import { PickupSetsController } from './pickup-sets.controller.js';
import { PickupSetsService } from './pickup-sets.service.js';

@Module({
  imports: [AttachmentsModule],
  controllers: [PickupSetsController],
  providers: [PickupSetsService],
  exports: [PickupSetsService],
})
export class PickupSetsModule {}
