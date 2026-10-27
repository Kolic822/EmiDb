import { type AttachmentOwner, TrashKind, type TrashItem } from '@emidb/shared';
import { BadRequestException, Inject, Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { and, eq, isNotNull, lt, type SQL } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';
import { AttachmentsService } from '../attachments/attachments.service.js';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db } from '../database/database.js';
import {
  manufacturers,
  pickupSets,
  pickups,
  potentiometerTypes,
  potLayouts,
  switchTypes,
  wiringDiagrams,
  wiringPickupTypes,
} from '../database/schema.js';

/** Deleted entries are kept this long before they are removed for good. */
export const TRASH_RETENTION_DAYS = 30;

type TrashTable = SQLiteTable & {
  id: any;
  name: any;
  deletedAt: any;
};

/** Where each kind lives, and the attachment owner whose files go with it. */
const REGISTRY: Record<TrashKind, { table: TrashTable; owner?: AttachmentOwner }> = {
  pickup: { table: pickups, owner: 'pickup' },
  pickupSet: { table: pickupSets, owner: 'pickupSet' },
  wiringDiagram: { table: wiringDiagrams, owner: 'wiringDiagram' },
  manufacturer: { table: manufacturers },
  potentiometerType: { table: potentiometerTypes },
  switchType: { table: switchTypes },
  wiringPickupType: { table: wiringPickupTypes },
  potLayout: { table: potLayouts, owner: 'potLayout' },
};

@Injectable()
export class TrashService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TrashService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly attachments: AttachmentsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.purgeExpired();
    this.timer = setInterval(() => void this.purgeExpired(), 24 * 60 * 60 * 1000);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.timer);
  }

  list(): TrashItem[] {
    const items: TrashItem[] = [];
    for (const kind of TrashKind.values) {
      const { table } = REGISTRY[kind];
      const rows = this.db
        .select({ id: table.id, name: table.name, deletedAt: table.deletedAt })
        .from(table)
        .where(isNotNull(table.deletedAt))
        .all() as { id: number; name: string; deletedAt: string }[];
      items.push(...rows.map((row) => ({ kind, id: row.id, name: row.name, deletedAt: row.deletedAt })));
    }
    return items.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
  }

  /** Brings an entry back; a name clash with a live entry is reported by the unique index. */
  restore(kind: string, id: number): void {
    const { table } = this.entry(kind);
    this.assertInTrash(table, id);
    this.db.update(table).set({ deletedAt: null }).where(eq(table.id, id)).run();
  }

  async purge(kind: string, id: number): Promise<void> {
    const { table, owner } = this.entry(kind);
    this.assertInTrash(table, id);
    if (owner) await this.attachments.removeAllFor(owner, id);
    this.db.delete(table).where(eq(table.id, id)).run();
  }

  async empty(): Promise<number> {
    return this.purgeWhere(undefined);
  }

  async purgeExpired(): Promise<number> {
    const cutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const count = await this.purgeWhere(cutoff);
    if (count) this.logger.log(`Removed ${count} entries that were in the trash for ${TRASH_RETENTION_DAYS} days`);
    return count;
  }

  private async purgeWhere(cutoff: string | undefined): Promise<number> {
    let count = 0;
    for (const kind of TrashKind.values) {
      const { table, owner } = REGISTRY[kind];
      const condition: SQL | undefined = cutoff
        ? and(isNotNull(table.deletedAt), lt(table.deletedAt, cutoff))
        : isNotNull(table.deletedAt);
      const rows = this.db.select({ id: table.id }).from(table).where(condition).all() as { id: number }[];
      for (const { id } of rows) {
        if (owner) await this.attachments.removeAllFor(owner, id);
        this.db.delete(table).where(eq(table.id, id)).run();
        count += 1;
      }
    }
    return count;
  }

  private entry(kind: string) {
    if (!TrashKind.is(kind)) throw new BadRequestException(`Unknown kind ${kind}`);
    return REGISTRY[kind];
  }

  private assertInTrash(table: TrashTable, id: number): void {
    const found = this.db
      .select({ id: table.id })
      .from(table)
      .where(and(eq(table.id, id), isNotNull(table.deletedAt)))
      .get();
    if (!found) notFound('Trash entry', id);
  }
}

