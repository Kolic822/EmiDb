import type { PickupSet } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, getTableColumns, inArray, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { AttachmentsService } from '../attachments/attachments.service.js';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import { manufacturers, pickupSets, pickups } from '../database/schema.js';
import type { PickupSetDto } from './pickup-set.dto.js';

const neck = alias(pickups, 'neck');
const middle = alias(pickups, 'middle');
const bridge = alias(pickups, 'bridge');

@Injectable()
export class PickupSetsService {
  private readonly selection = {
    ...getTableColumns(pickupSets),
    manufacturerName: manufacturers.name,
    neckName: neck.name,
    middleName: middle.name,
    bridgeName: bridge.name,
  };

  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly attachments: AttachmentsService,
  ) {}

  findAll(): PickupSet[] {
    return this.query().orderBy(asc(pickupSets.name)).all();
  }

  findOne(id: number): PickupSet {
    return this.query().where(eq(pickupSets.id, id)).get() ?? notFound('Pickup set', id);
  }

  findByPickup(pickupId: number): PickupSet[] {
    return this.query()
      .where(
        or(eq(pickupSets.neckId, pickupId), eq(pickupSets.middleId, pickupId), eq(pickupSets.bridgeId, pickupId)),
      )
      .orderBy(asc(pickupSets.name))
      .all();
  }

  create(dto: PickupSetDto): PickupSet {
    const { id } = this.db.insert(pickupSets).values(toRow(dto)).returning({ id: pickupSets.id }).get();
    return this.findOne(id);
  }

  update(id: number, dto: PickupSetDto): PickupSet {
    this.findOne(id);
    this.db
      .update(pickupSets)
      .set({ ...toRow(dto), updatedAt: now() })
      .where(eq(pickupSets.id, id))
      .run();
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    this.findOne(id);
    await this.attachments.removeAllFor('pickupSet', id);
    this.db.delete(pickupSets).where(eq(pickupSets.id, id)).run();
  }

  async removeMany(ids: number[]): Promise<void> {
    if (!ids.length) return;
    await Promise.all(ids.map((id) => this.attachments.removeAllFor('pickupSet', id)));
    this.db.delete(pickupSets).where(inArray(pickupSets.id, ids)).run();
  }

  private query() {
    return this.db
      .select(this.selection)
      .from(pickupSets)
      .leftJoin(manufacturers, eq(pickupSets.manufacturerId, manufacturers.id))
      .leftJoin(neck, eq(pickupSets.neckId, neck.id))
      .leftJoin(middle, eq(pickupSets.middleId, middle.id))
      .leftJoin(bridge, eq(pickupSets.bridgeId, bridge.id));
  }
}

function toRow(dto: PickupSetDto): typeof pickupSets.$inferInsert {
  return {
    name: dto.name,
    manufacturerId: dto.manufacturerId ?? null,
    neckId: dto.neckId ?? null,
    middleId: dto.middleId ?? null,
    bridgeId: dto.bridgeId ?? null,
    description: dto.description ?? null,
  };
}
