import type { PickupSet } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, getTableColumns, inArray, isNull, or } from 'drizzle-orm';
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
    return this.attachments.withAttachments(
      'pickupSet',
      this.query().where(isNull(pickupSets.deletedAt)).orderBy(asc(pickupSets.name)).all(),
    );
  }

  findOne(id: number): PickupSet {
    const row =
      this.query().where(and(eq(pickupSets.id, id), isNull(pickupSets.deletedAt))).get() ?? notFound('Pickup set', id);
    return this.attachments.withAttachments('pickupSet', [row])[0];
  }

  findByPickup(pickupId: number): PickupSet[] {
    const rows = this.query()
      .where(
        and(
          isNull(pickupSets.deletedAt),
          or(eq(pickupSets.neckId, pickupId), eq(pickupSets.middleId, pickupId), eq(pickupSets.bridgeId, pickupId)),
        ),
      )
      .orderBy(asc(pickupSets.name))
      .all();
    return this.attachments.withAttachments('pickupSet', rows);
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

  remove(id: number): void {
    this.findOne(id);
    this.removeMany([id]);
  }

  /** Moved to the trash; its files stay until the trash entry is purged. */
  removeMany(ids: number[]): void {
    if (ids.length) this.db.update(pickupSets).set({ deletedAt: now() }).where(inArray(pickupSets.id, ids)).run();
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
