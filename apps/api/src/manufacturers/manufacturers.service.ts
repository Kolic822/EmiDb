import type { Manufacturer } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { AttachmentsService } from '../attachments/attachments.service.js';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import { manufacturers } from '../database/schema.js';
import type { ManufacturerDto } from './manufacturer.dto.js';

@Injectable()
export class ManufacturersService {
  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly attachments: AttachmentsService,
  ) {}

  findAll(): Manufacturer[] {
    const rows = this.db.select().from(manufacturers).where(isNull(manufacturers.deletedAt)).orderBy(asc(manufacturers.name)).all();
    return this.attachments.withAttachments('manufacturer', rows);
  }

  findOne(id: number): Manufacturer {
    const row =
      this.db
        .select()
        .from(manufacturers)
        .where(and(eq(manufacturers.id, id), isNull(manufacturers.deletedAt)))
        .get() ?? notFound('Manufacturer', id);
    return this.attachments.withAttachments('manufacturer', [row])[0];
  }

  create(dto: ManufacturerDto): Manufacturer {
    const { id } = this.db.insert(manufacturers).values(this.toRow(dto)).returning({ id: manufacturers.id }).get();
    return this.findOne(id);
  }

  update(id: number, dto: ManufacturerDto): Manufacturer {
    this.findOne(id);
    this.db
      .update(manufacturers)
      .set({ ...this.toRow(dto), updatedAt: now() })
      .where(eq(manufacturers.id, id))
      .run();
    return this.findOne(id);
  }

  remove(id: number): void {
    this.findOne(id);
    this.removeMany([id]);
  }

  removeMany(ids: number[]): void {
    // Moved to the trash; the trash module restores or purges it.
    if (ids.length) this.db.update(manufacturers).set({ deletedAt: now() }).where(inArray(manufacturers.id, ids)).run();
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
