import type { PotLayout } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { AttachmentsService } from '../attachments/attachments.service.js';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import { potLayouts } from '../database/schema.js';
import type { PotLayoutDto } from './pot-layout.dto.js';

@Injectable()
export class PotLayoutsService {
  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly attachments: AttachmentsService,
  ) {}

  findAll(): PotLayout[] {
    const rows = this.db.select().from(potLayouts).where(isNull(potLayouts.deletedAt)).orderBy(asc(potLayouts.name)).all();
    return this.attachments.withAttachments('potLayout', rows) as PotLayout[];
  }

  findOne(id: number): PotLayout {
    const row =
      this.db
        .select()
        .from(potLayouts)
        .where(and(eq(potLayouts.id, id), isNull(potLayouts.deletedAt)))
        .get() ?? notFound('Pot layout', id);
    return this.attachments.withAttachments('potLayout', [row])[0] as PotLayout;
  }

  create(dto: PotLayoutDto): PotLayout {
    const { id } = this.db.insert(potLayouts).values(toRow(dto)).returning({ id: potLayouts.id }).get();
    return this.findOne(id);
  }

  update(id: number, dto: PotLayoutDto): PotLayout {
    this.findOne(id);
    this.db
      .update(potLayouts)
      .set({ ...toRow(dto), updatedAt: now() })
      .where(eq(potLayouts.id, id))
      .run();
    return this.findOne(id);
  }

  remove(id: number): void {
    this.findOne(id);
    this.removeMany([id]);
  }

  /** Moved to the trash; its files stay until the trash entry is purged. */
  removeMany(ids: number[]): void {
    if (ids.length) this.db.update(potLayouts).set({ deletedAt: now() }).where(inArray(potLayouts.id, ids)).run();
  }
}

function toRow(dto: PotLayoutDto) {
  return { name: dto.name, roles: dto.roles, description: dto.description ?? null };
}
