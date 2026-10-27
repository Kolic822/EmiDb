import type { PotLayout } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
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
    const rows = this.db.select().from(potLayouts).orderBy(asc(potLayouts.name)).all();
    return this.attachments.withAttachments('potLayout', rows) as PotLayout[];
  }

  findOne(id: number): PotLayout {
    const row = this.db.select().from(potLayouts).where(eq(potLayouts.id, id)).get() ?? notFound('Pot layout', id);
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

  async remove(id: number): Promise<void> {
    this.findOne(id);
    await this.attachments.removeAllFor('potLayout', id);
    this.db.delete(potLayouts).where(eq(potLayouts.id, id)).run();
  }

  async removeMany(ids: number[]): Promise<void> {
    if (!ids.length) return;
    await Promise.all(ids.map((id) => this.attachments.removeAllFor('potLayout', id)));
    this.db.delete(potLayouts).where(inArray(potLayouts.id, ids)).run();
  }
}

function toRow(dto: PotLayoutDto) {
  return { name: dto.name, roles: dto.roles, description: dto.description ?? null };
}
