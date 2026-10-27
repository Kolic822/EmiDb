import { Module } from '@nestjs/common';
import { AttachmentsModule } from '../attachments/attachments.module.js';
import { TrashController } from './trash.controller.js';
import { TrashService } from './trash.service.js';

@Module({ imports: [AttachmentsModule], controllers: [TrashController], providers: [TrashService] })
export class TrashModule {}
