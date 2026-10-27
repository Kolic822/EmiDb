import { PICKUP_FIELDS, type Pickup } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, getTableColumns, inArray } from 'drizzle-orm';
import { AttachmentsService } from '../attachments/attachments.service.js';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import { manufacturers, pickups } from '../database/schema.js';
import type { PickupDto } from './pickup.dto.js';

@Injectable()
export class PickupsService {
  private readonly selection = { ...getTableColumns(pickups), manufacturerName: manufacturers.name };

  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly attachments: AttachmentsService,
  ) {}

  findAll(): Pickup[] {
    return this.attachments.withAttachments('pickup', this.query().orderBy(asc(pickups.name)).all()) as Pickup[];
  }

  findOne(id: number): Pickup {
    const row = this.query().where(eq(pickups.id, id)).get() ?? notFound('Pickup', id);
    return this.attachments.withAttachments('pickup', [row])[0] as Pickup;
  }

  create(dto: PickupDto): Pickup {
    const { id } = this.db.insert(pickups).values(toRow(dto)).returning({ id: pickups.id }).get();
    return this.findOne(id);
  }

  update(id: number, dto: PickupDto): Pickup {
    this.findOne(id);
    this.db
      .update(pickups)
      .set({ ...toRow(dto), updatedAt: now() })
      .where(eq(pickups.id, id))
      .run();
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    this.findOne(id);
    await this.attachments.removeAllFor('pickup', id);
    this.db.delete(pickups).where(eq(pickups.id, id)).run();
  }

  async removeMany(ids: number[]): Promise<void> {
    if (!ids.length) return;
    await Promise.all(ids.map((id) => this.attachments.removeAllFor('pickup', id)));
    this.db.delete(pickups).where(inArray(pickups.id, ids)).run();
  }

  private query() {
    return this.db
      .select(this.selection)
      .from(pickups)
      .leftJoin(manufacturers, eq(pickups.manufacturerId, manufacturers.id));
  }
}

/** Every writable field, with missing values stored as NULL so PUT replaces the whole record. */
function toRow(dto: PickupDto): typeof pickups.$inferInsert {
  const row: Record<string, unknown> = {};
  for (const field of PICKUP_FIELDS) {
    row[field.key] = dto[field.key as keyof PickupDto] ?? null;
  }
  return row as typeof pickups.$inferInsert;
}
