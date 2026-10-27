import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { rm } from 'node:fs/promises';
import { BackupService, type RestoreResult } from './backup.service.js';
import { restoreUploadOptions } from './restore-upload.options.js';

@Controller('backup')
export class BackupController {
  constructor(private readonly service: BackupService) {}

  /** Download everything (database and files) as one zip. */
  @Get()
  async download(): Promise<StreamableFile> {
    const archive = await this.service.createBackup();
    const day = new Date().toISOString().slice(0, 10);
    return new StreamableFile(archive, {
      type: 'application/zip',
      disposition: `attachment; filename="emidb-backup-${day}.zip"`,
    });
  }

  /** Replace all data with the contents of an uploaded backup zip. */
  @Post('restore')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', restoreUploadOptions))
  async restore(@UploadedFile() file: Express.Multer.File | undefined): Promise<RestoreResult> {
    if (!file) throw new BadRequestException('No backup file uploaded');
    try {
      return await this.service.restore(file.path);
    } finally {
      await rm(file.path, { force: true });
    }
  }
}
