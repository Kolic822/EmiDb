import { isFieldRelevant, WIRING_DIAGRAM_FIELDS, type WiringDiagram } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, getTableColumns, inArray, isNull } from 'drizzle-orm';
import { AttachmentsService } from '../attachments/attachments.service.js';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import { manufacturers, wiringDiagrams, wiringDiagramSwitches } from '../database/schema.js';
import type { WiringDiagramDto } from './wiring-diagram.dto.js';

type DiagramRow = typeof wiringDiagrams.$inferSelect & { manufacturerName: string | null };

@Injectable()
export class WiringDiagramsService {
  private readonly selection = { ...getTableColumns(wiringDiagrams), manufacturerName: manufacturers.name };

  constructor(
    @Inject(DATABASE) private readonly db: Db,
    private readonly attachments: AttachmentsService,
  ) {}

  findAll(): WiringDiagram[] {
    const rows = this.query().where(isNull(wiringDiagrams.deletedAt)).orderBy(asc(wiringDiagrams.name)).all();
    return this.withComponents(rows);
  }

  findOne(id: number): WiringDiagram {
    const row =
      this.query().where(and(eq(wiringDiagrams.id, id), isNull(wiringDiagrams.deletedAt))).get() ??
      notFound('Wiring diagram', id);
    return this.withComponents([row])[0];
  }

  create(dto: WiringDiagramDto): WiringDiagram {
    const id = this.db.transaction((tx) => {
      const { id } = tx.insert(wiringDiagrams).values(toRow(dto)).returning({ id: wiringDiagrams.id }).get();
      this.writeSwitches(tx, id, dto);
      return id;
    });
    return this.findOne(id);
  }

  update(id: number, dto: WiringDiagramDto): WiringDiagram {
    this.findOne(id);
    this.db.transaction((tx) => {
      tx.update(wiringDiagrams)
        .set({ ...toRow(dto), updatedAt: now() })
        .where(eq(wiringDiagrams.id, id))
        .run();
      tx.delete(wiringDiagramSwitches).where(eq(wiringDiagramSwitches.diagramId, id)).run();
      this.writeSwitches(tx, id, dto);
    });
    return this.findOne(id);
  }

  remove(id: number): void {
    this.findOne(id);
    this.removeMany([id]);
  }

  /** Moved to the trash; its files stay until the trash entry is purged. */
  removeMany(ids: number[]): void {
    if (ids.length) this.db.update(wiringDiagrams).set({ deletedAt: now() }).where(inArray(wiringDiagrams.id, ids)).run();
  }

  private query() {
    return this.db
      .select(this.selection)
      .from(wiringDiagrams)
      .leftJoin(manufacturers, eq(wiringDiagrams.manufacturerId, manufacturers.id));
  }

  private writeSwitches(tx: Db, diagramId: number, dto: WiringDiagramDto): void {
    const switches = dto.switches.map((switchTypeId, position) => ({ diagramId, switchTypeId, position }));
    if (switches.length) tx.insert(wiringDiagramSwitches).values(switches).run();
  }

  /** Attaches ordered switch ids to each diagram row. */
  private withComponents(rows: DiagramRow[]): WiringDiagram[] {
    if (!rows.length) return [];
    const switches = this.db
      .select()
      .from(wiringDiagramSwitches)
      .where(inArray(wiringDiagramSwitches.diagramId, rows.map((row) => row.id)))
      .orderBy(asc(wiringDiagramSwitches.position))
      .all();
    const withSwitches = rows.map((row) => ({
      ...row,
      switches: switches.filter((s) => s.diagramId === row.id).map((s) => s.switchTypeId),
    }));
    return this.attachments.withAttachments('wiringDiagram', withSwitches) as WiringDiagram[];
  }
}

/**
 * Every scalar field, with missing values as NULL. Pot positions beyond the
 * chosen count are cleared so stale values never leak into filters.
 */
function toRow(dto: WiringDiagramDto): typeof wiringDiagrams.$inferInsert {
  const row: Record<string, unknown> = {};
  for (const field of WIRING_DIAGRAM_FIELDS) {
    if (field.key === 'switches' || field.transient) continue;
    const value = dto[field.key as keyof WiringDiagramDto] ?? null;
    row[field.key] = isFieldRelevant(field, dto as Partial<WiringDiagram>) ? value : null;
  }
  return row as typeof wiringDiagrams.$inferInsert;
}
