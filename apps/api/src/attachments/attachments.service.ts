import type { Attachment, AttachmentOwner } from '@emidb/shared';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { createReadStream, existsSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { notFound } from '../common/errors.js';
import { config } from '../config.js';
import { DATABASE, type Db } from '../database/database.js';
import { attachments, pickupSets, pickups, potLayouts, wiringDiagrams } from '../database/schema.js';
import type { UpdateAttachmentDto, UploadAttachmentDto } from './attachment.dto.js';

type AttachmentRow = typeof attachments.$inferSelect;

const OWNER_TABLES = {
  pickup: pickups,
  wiringDiagram: wiringDiagrams,
  pickupSet: pickupSets,
  potLayout: potLayouts,
} as const;

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(@Inject(DATABASE) private readonly db: Db) {}

  findFor(owner: AttachmentOwner, ownerId: number): Attachment[] {
    return this.db
      .select()
      .from(attachments)
      .where(and(eq(attachments.owner, owner), eq(attachments.ownerId, ownerId)))
      .orderBy(desc(attachments.createdAt))
      .all()
      .map(toModel);
  }

  findOne(id: number): Attachment {
    return toModel(this.row(id));
  }

  /** Adds each row's attachments (one query for the whole list). */
  withAttachments<T extends { id: number }>(owner: AttachmentOwner, rows: T[]): (T & { attachments: Attachment[] })[] {
    if (!rows.length) return [];
    const all = this.db
      .select()
      .from(attachments)
      .where(and(eq(attachments.owner, owner), inArray(attachments.ownerId, rows.map((row) => row.id))))
      .orderBy(desc(attachments.createdAt))
      .all();
    return rows.map((row) => ({
      ...row,
      attachments: all.filter((a) => a.ownerId === row.id).map(toModel),
    }));
  }

  create(dto: UploadAttachmentDto, file: Express.Multer.File): Attachment {
    this.assertOwnerExists(dto.owner, dto.ownerId);
    const row = this.db
      .insert(attachments)
      .values({
        owner: dto.owner,
        ownerId: dto.ownerId,
        fileName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        caption: dto.caption ?? null,
      })
      .returning()
      .get();
    return toModel(row);
  }

  update(id: number, dto: UpdateAttachmentDto): Attachment {
    this.row(id);
    const row = this.db
      .update(attachments)
      .set({ caption: dto.caption ?? null })
      .where(eq(attachments.id, id))
      .returning()
      .get();
    return toModel(row);
  }

  /** Streams the stored file; the caller sets headers from the returned metadata. */
  openFile(id: number) {
    const row = this.row(id);
    const filePath = path.join(config.uploadsDir, row.storedName);
    if (!existsSync(filePath)) notFound('Attachment file', id);
    return { attachment: toModel(row), stream: createReadStream(filePath) };
  }

  async remove(id: number): Promise<void> {
    const row = this.row(id);
    this.db.delete(attachments).where(eq(attachments.id, id)).run();
    await this.deleteFile(row.storedName);
  }

  /** Called by owners when they are deleted. */
  async removeAllFor(owner: AttachmentOwner, ownerId: number): Promise<void> {
    const rows = this.db
      .delete(attachments)
      .where(and(eq(attachments.owner, owner), eq(attachments.ownerId, ownerId)))
      .returning()
      .all();
    await Promise.all(rows.map((row) => this.deleteFile(row.storedName)));
  }

  /** Removes a file that was uploaded but could not be registered. */
  async discardUpload(file: Express.Multer.File | undefined): Promise<void> {
    if (file) await this.deleteFile(file.filename);
  }

  private row(id: number): AttachmentRow {
    return this.db.select().from(attachments).where(eq(attachments.id, id)).get() ?? notFound('Attachment', id);
  }

  private assertOwnerExists(owner: AttachmentOwner, ownerId: number): void {
    const table = OWNER_TABLES[owner];
    const found = this.db.select({ id: table.id }).from(table).where(eq(table.id, ownerId)).get();
    if (!found) notFound(owner, ownerId);
  }

  private async deleteFile(storedName: string): Promise<void> {
    try {
      await unlink(path.join(config.uploadsDir, storedName));
    } catch (error) {
      this.logger.warn(`Could not delete ${storedName}: ${(error as Error).message}`);
    }
  }
}

function toModel(row: AttachmentRow): Attachment {
  return {
    id: row.id,
    owner: row.owner,
    ownerId: row.ownerId,
    fileName: row.fileName,
    mimeType: row.mimeType,
    size: row.size,
    caption: row.caption,
    createdAt: row.createdAt,
    url: `/api/attachments/${row.id}/file`,
  };
}
