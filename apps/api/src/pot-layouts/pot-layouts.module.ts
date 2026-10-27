import { Module } from '@nestjs/common';
import { PotLayoutsController } from './pot-layouts.controller.js';
import { PotLayoutsService } from './pot-layouts.service.js';

@Module({ controllers: [PotLayoutsController], providers: [PotLayoutsService], exports: [PotLayoutsService] })
export class PotLayoutsModule {}
