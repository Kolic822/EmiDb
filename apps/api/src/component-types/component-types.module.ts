import { Module } from '@nestjs/common';
import { PotentiometerTypesController, SwitchTypesController } from './component-types.controller.js';
import { PotentiometerTypesService, SwitchTypesService } from './component-types.service.js';

@Module({
  controllers: [PotentiometerTypesController, SwitchTypesController],
  providers: [PotentiometerTypesService, SwitchTypesService],
  exports: [PotentiometerTypesService, SwitchTypesService],
})
export class ComponentTypesModule {}
