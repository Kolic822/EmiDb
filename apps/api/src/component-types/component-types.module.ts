import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module.js';
import { PotentiometerTypesController, SwitchTypesController } from './component-types.controller.js';
import { PotentiometerTypesService, SwitchTypesService } from './component-types.service.js';

@Module({
  imports: [AttachmentsModule],
  controllers: [PotentiometerTypesController, SwitchTypesController],
  providers: [PotentiometerTypesService, SwitchTypesService],
  exports: [PotentiometerTypesService, SwitchTypesService],
})
export class ComponentTypesModule {}
