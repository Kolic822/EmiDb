import type { WiringPickupType } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import { wiringPickupTypes } from '../database/schema.js';
import type { WiringPickupTypeDto } from './wiring-pickup-type.dto.js';

@Injectable()
export class WiringPickupTypesService {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  findAll(): WiringPickupType[] {
    return this.db
      .select()
      .from(wiringPickupTypes)
      .where(isNull(wiringPickupTypes.deletedAt))
      .orderBy(asc(wiringPickupTypes.name))
      .all() as WiringPickupType[];
  }

  findOne(id: number): WiringPickupType {
    return (
      (this.db
        .select()
        .from(wiringPickupTypes)
        .where(and(eq(wiringPickupTypes.id, id), isNull(wiringPickupTypes.deletedAt)))
        .get() as WiringPickupType | undefined) ??
      notFound('Pickup type', id)
    );
  }

  create(dto: WiringPickupTypeDto): WiringPickupType {
    return this.db.insert(wiringPickupTypes).values(toRow(dto)).returning().get() as WiringPickupType;
  }

  update(id: number, dto: WiringPickupTypeDto): WiringPickupType {
    this.findOne(id);
    return this.db
      .update(wiringPickupTypes)
      .set({ ...toRow(dto), updatedAt: now() })
      .where(eq(wiringPickupTypes.id, id))
      .returning()
      .get() as WiringPickupType;
  }

  remove(id: number): void {
    this.findOne(id);
    this.removeMany([id]);
  }

  removeMany(ids: number[]): void {
    // Moved to the trash; the trash module restores or purges it.
    if (ids.length) this.db.update(wiringPickupTypes).set({ deletedAt: now() }).where(inArray(wiringPickupTypes.id, ids)).run();
  }
}

function toRow(dto: WiringPickupTypeDto) {
  return { name: dto.name, instrument: dto.instrument ?? null, description: dto.description ?? null };
}
