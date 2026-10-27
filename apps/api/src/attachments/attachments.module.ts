import { Module } from '@nestjs/common';
import { AttachmentsController, LibraryController } from './attachments.controller.js';
import { AttachmentsService } from './attachments.service.js';

@Module({
  controllers: [AttachmentsController, LibraryController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
