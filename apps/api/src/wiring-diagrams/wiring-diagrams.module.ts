import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module.js';
import { WiringDiagramsController } from './wiring-diagrams.controller.js';
import { WiringDiagramsService } from './wiring-diagrams.service.js';

@Module({
  imports: [AttachmentsModule],
  controllers: [WiringDiagramsController],
  providers: [WiringDiagramsService],
  exports: [WiringDiagramsService],
})
export class WiringDiagramsModule {}
