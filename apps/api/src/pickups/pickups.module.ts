import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module.js';
import { PickupSetsModule } from '../pickup-sets/pickup-sets.module.js';
import { PickupsController } from './pickups.controller.js';
import { PickupsService } from './pickups.service.js';

@Module({
  imports: [AttachmentsModule, PickupSetsModule],
  controllers: [PickupsController],
  providers: [PickupsService],
  exports: [PickupsService],
})
export class PickupsModule {}
