import type { ComponentType } from '@emidb/shared';
import { Inject, Injectable } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import { potentiometerTypes, switchTypes } from '../database/schema.js';
import type { ComponentTypeDto } from './component-type.dto.js';

type ComponentTable = typeof potentiometerTypes | typeof switchTypes;

/** Generic CRUD for simple name/description lookup tables. */
export abstract class ComponentTypesService {
  protected constructor(
    protected readonly db: Db,
    private readonly table: ComponentTable,
    private readonly label: string,
  ) {}

  findAll(): ComponentType[] {
    return this.db.select().from(this.table).orderBy(asc(this.table.name)).all();
  }

  findOne(id: number): ComponentType {
    return this.db.select().from(this.table).where(eq(this.table.id, id)).get() ?? notFound(this.label, id);
  }

  create(dto: ComponentTypeDto): ComponentType {
    return this.db.insert(this.table).values(this.toRow(dto)).returning().get();
  }

  update(id: number, dto: ComponentTypeDto): ComponentType {
    this.findOne(id);
    return this.db
      .update(this.table)
      .set({ ...this.toRow(dto), updatedAt: now() })
      .where(eq(this.table.id, id))
      .returning()
      .get();
  }

  remove(id: number): void {
    this.findOne(id);
    this.db.delete(this.table).where(eq(this.table.id, id)).run();
  }

  removeMany(ids: number[]): void {
    if (ids.length) this.db.delete(this.table).where(inArray(this.table.id, ids)).run();
  }

  private toRow(dto: ComponentTypeDto) {
    return { name: dto.name, description: dto.description ?? null };
  }
}

@Injectable()
export class PotentiometerTypesService extends ComponentTypesService {
  constructor(@Inject(DATABASE) db: Db) {
    super(db, potentiometerTypes, 'Potentiometer type');
  }
}

@Injectable()
export class SwitchTypesService extends ComponentTypesService {
  constructor(@Inject(DATABASE) db: Db) {
    super(db, switchTypes, 'Switch type');
  }
}
