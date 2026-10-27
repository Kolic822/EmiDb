import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ListAttachmentsQuery, UpdateAttachmentDto, UploadAttachmentDto } from './attachment.dto.js';
import { AttachmentsService } from './attachments.service.js';
import { uploadOptions } from './upload.options.js';

/** Every reference file in one list. */
@Controller('library')
export class LibraryController {
  constructor(private readonly service: AttachmentsService) {}

  @Get()
  list() {
    return this.service.library();
  }
}

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly service: AttachmentsService) {}

  @Get()
  findFor(@Query() query: ListAttachmentsQuery) {
    return this.service.findFor(query.owner, query.ownerId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  async upload(@UploadedFile() file: Express.Multer.File | undefined, @Body() dto: UploadAttachmentDto) {
    if (!file) throw new BadRequestException('No file uploaded');
    try {
      return this.service.create(dto, file);
    } catch (error) {
      await this.service.discardUpload(file);
      throw error;
    }
  }

  @Get(':id/file')
  file(
    @Param('id', ParseIntPipe) id: number,
    @Query('download') download: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { attachment, stream } = this.service.openFile(id);
    const disposition = download != null ? 'attachment' : 'inline';
    res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    return new StreamableFile(stream, {
      type: attachment.mimeType,
      length: attachment.size,
      disposition: `${disposition}; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
    });
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAttachmentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
