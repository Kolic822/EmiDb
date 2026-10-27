import type { Manufacturer } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import { manufacturers } from '../database/schema.js';
import type { ManufacturerDto } from './manufacturer.dto.js';

@Injectable()
export class ManufacturersService {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  findAll(): Manufacturer[] {
    return this.db.select().from(manufacturers).orderBy(asc(manufacturers.name)).all();
  }

  findOne(id: number): Manufacturer {
    return this.db.select().from(manufacturers).where(eq(manufacturers.id, id)).get() ?? notFound('Manufacturer', id);
  }

  create(dto: ManufacturerDto): Manufacturer {
    return this.db.insert(manufacturers).values(this.toRow(dto)).returning().get();
  }

  update(id: number, dto: ManufacturerDto): Manufacturer {
    this.findOne(id);
    return this.db
      .update(manufacturers)
      .set({ ...this.toRow(dto), updatedAt: now() })
      .where(eq(manufacturers.id, id))
      .returning()
      .get();
  }

  remove(id: number): void {
    this.findOne(id);
    this.db.delete(manufacturers).where(eq(manufacturers.id, id)).run();
  }

  removeMany(ids: number[]): void {
    if (ids.length) this.db.delete(manufacturers).where(inArray(manufacturers.id, ids)).run();
  }

  private toRow(dto: ManufacturerDto) {
    return {
      name: dto.name,
      country: dto.country ?? null,
      website: dto.website ?? null,
      notes: dto.notes ?? null,
    };
  }
}
