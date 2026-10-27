import { Module } from '@nestjs/common';
import { WiringPickupTypesController } from './wiring-pickup-types.controller.js';
import { WiringPickupTypesService } from './wiring-pickup-types.service.js';

@Module({
  controllers: [WiringPickupTypesController],
  providers: [WiringPickupTypesService],
  exports: [WiringPickupTypesService],
})
export class WiringPickupTypesModule {}
