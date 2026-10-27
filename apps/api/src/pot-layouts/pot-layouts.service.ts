import type { PotLayout } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import { potLayouts } from '../database/schema.js';
import type { PotLayoutDto } from './pot-layout.dto.js';

@Injectable()
export class PotLayoutsService {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  findAll(): PotLayout[] {
    return this.db.select().from(potLayouts).orderBy(asc(potLayouts.name)).all() as PotLayout[];
  }

  findOne(id: number): PotLayout {
    return (
      (this.db.select().from(potLayouts).where(eq(potLayouts.id, id)).get() as PotLayout | undefined) ??
      notFound('Pot layout', id)
    );
  }

  create(dto: PotLayoutDto): PotLayout {
    return this.db.insert(potLayouts).values(toRow(dto)).returning().get() as PotLayout;
  }

  update(id: number, dto: PotLayoutDto): PotLayout {
    this.findOne(id);
    return this.db
      .update(potLayouts)
      .set({ ...toRow(dto), updatedAt: now() })
      .where(eq(potLayouts.id, id))
      .returning()
      .get() as PotLayout;
  }

  remove(id: number): void {
    this.findOne(id);
    this.db.delete(potLayouts).where(eq(potLayouts.id, id)).run();
  }

  removeMany(ids: number[]): void {
    if (ids.length) this.db.delete(potLayouts).where(inArray(potLayouts.id, ids)).run();
  }
}

function toRow(dto: PotLayoutDto) {
  return { name: dto.name, roles: dto.roles, description: dto.description ?? null };
}
