import type { WiringDiagram } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, getTableColumns, inArray } from 'drizzle-orm';
import { AttachmentsService } from '../attachments/attachments.service.js';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import {
  manufacturers,
  wiringDiagramPots,
  wiringDiagrams,
  wiringDiagramSwitches,
} from '../database/schema.js';
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
    const rows = this.query().orderBy(asc(wiringDiagrams.name)).all();
    return this.withComponents(rows);
  }

  findOne(id: number): WiringDiagram {
    const row = this.query().where(eq(wiringDiagrams.id, id)).get() ?? notFound('Wiring diagram', id);
    return this.withComponents([row])[0];
  }

  create(dto: WiringDiagramDto): WiringDiagram {
    const id = this.db.transaction((tx) => {
      const { id } = tx.insert(wiringDiagrams).values(toRow(dto)).returning({ id: wiringDiagrams.id }).get();
      this.writeComponents(tx, id, dto);
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
      tx.delete(wiringDiagramPots).where(eq(wiringDiagramPots.diagramId, id)).run();
      tx.delete(wiringDiagramSwitches).where(eq(wiringDiagramSwitches.diagramId, id)).run();
      this.writeComponents(tx, id, dto);
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    this.findOne(id);
    await this.attachments.removeAllFor('wiringDiagram', id);
    this.db.delete(wiringDiagrams).where(eq(wiringDiagrams.id, id)).run();
  }

  async removeMany(ids: number[]): Promise<void> {
    if (!ids.length) return;
    await Promise.all(ids.map((id) => this.attachments.removeAllFor('wiringDiagram', id)));
    this.db.delete(wiringDiagrams).where(inArray(wiringDiagrams.id, ids)).run();
  }

  private query() {
    return this.db
      .select(this.selection)
      .from(wiringDiagrams)
      .leftJoin(manufacturers, eq(wiringDiagrams.manufacturerId, manufacturers.id));
  }

  private writeComponents(tx: Db, diagramId: number, dto: WiringDiagramDto): void {
    const pots = [
      ...dto.volumePots.map((potTypeId, position) => ({ diagramId, potTypeId, role: 'volume' as const, position })),
      ...dto.tonePots.map((potTypeId, position) => ({ diagramId, potTypeId, role: 'tone' as const, position })),
    ];
    if (pots.length) tx.insert(wiringDiagramPots).values(pots).run();
    const switches = dto.switches.map((switchTypeId, position) => ({ diagramId, switchTypeId, position }));
    if (switches.length) tx.insert(wiringDiagramSwitches).values(switches).run();
  }

  /** Attaches ordered pot and switch ids to each diagram row. */
  private withComponents(rows: DiagramRow[]): WiringDiagram[] {
    if (!rows.length) return [];
    const ids = rows.map((row) => row.id);
    const pots = this.db
      .select()
      .from(wiringDiagramPots)
      .where(inArray(wiringDiagramPots.diagramId, ids))
      .orderBy(asc(wiringDiagramPots.position))
      .all();
    const switches = this.db
      .select()
      .from(wiringDiagramSwitches)
      .where(inArray(wiringDiagramSwitches.diagramId, ids))
      .orderBy(asc(wiringDiagramSwitches.position))
      .all();

    return rows.map((row) => ({
      ...(row as WiringDiagram),
      volumePots: pots.filter((p) => p.diagramId === row.id && p.role === 'volume').map((p) => p.potTypeId),
      tonePots: pots.filter((p) => p.diagramId === row.id && p.role === 'tone').map((p) => p.potTypeId),
      switches: switches.filter((s) => s.diagramId === row.id).map((s) => s.switchTypeId),
    }));
  }
}

function toRow(dto: WiringDiagramDto): typeof wiringDiagrams.$inferInsert {
  return {
    name: dto.name,
    manufacturerId: dto.manufacturerId ?? null,
    wiringType: dto.wiringType ?? null,
    pickupCount: dto.pickupCount ?? null,
    neck: dto.neck ?? null,
    middle: dto.middle ?? null,
    bridge: dto.bridge ?? null,
    phaseReversible: dto.phaseReversible ?? null,
    splitCoil: dto.splitCoil ?? null,
    serial: dto.serial ?? null,
    parallel: dto.parallel ?? null,
    description: dto.description ?? null,
  };
}
