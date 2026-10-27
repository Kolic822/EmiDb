import type { ComponentType, SwitchType } from '@emidb/shared';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull, ne } from 'drizzle-orm';
import { notFound } from '../common/errors.js';
import { DATABASE, type Db, now } from '../database/database.js';
import { potentiometerTypes, switchTypes } from '../database/schema.js';
import type { ComponentTypeDto, SwitchTypeDto } from './component-type.dto.js';

type ComponentTable = typeof potentiometerTypes | typeof switchTypes;

/** Generic CRUD for simple name/description lookup tables. */
export abstract class ComponentTypesService {
  protected constructor(
    protected readonly db: Db,
    private readonly table: ComponentTable,
    private readonly label: string,
  ) {}

  findAll(): ComponentType[] {
    return this.db.select().from(this.table).where(isNull(this.table.deletedAt)).orderBy(asc(this.table.name)).all();
  }

  findOne(id: number): ComponentType {
    return (
      this.db
        .select()
        .from(this.table)
        .where(and(eq(this.table.id, id), isNull(this.table.deletedAt)))
        .get() ?? notFound(this.label, id)
    );
  }

  create(dto: ComponentTypeDto): ComponentType {
    return this.db.insert(this.table).values(this.toRow(dto) as typeof this.table.$inferInsert).returning().get();
  }

  update(id: number, dto: ComponentTypeDto): ComponentType {
    this.findOne(id);
    return this.db
      .update(this.table)
      .set({ ...(this.toRow(dto) as typeof this.table.$inferInsert), updatedAt: now() })
      .where(eq(this.table.id, id))
      .returning()
      .get();
  }

  remove(id: number): void {
    this.findOne(id);
    this.removeMany([id]);
  }

  removeMany(ids: number[]): void {
    // Moved to the trash; the trash module restores or purges it.
    if (ids.length) this.db.update(this.table).set({ deletedAt: now() }).where(inArray(this.table.id, ids)).run();
  }

  protected toRow(dto: ComponentTypeDto): Record<string, unknown> {
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

  override findAll(): SwitchType[] {
    return super.findAll() as SwitchType[];
  }

  override create(dto: SwitchTypeDto): SwitchType {
    this.assertUnique(dto);
    return super.create(dto) as SwitchType;
  }

  override update(id: number, dto: SwitchTypeDto): SwitchType {
    this.assertUnique(dto, id);
    return super.update(id, dto) as SwitchType;
  }

  /** Name must be unique per manufacturer; the index cannot enforce this for a missing manufacturer. */
  private assertUnique(dto: SwitchTypeDto, exceptId?: number): void {
    const sameManufacturer =
      dto.manufacturerId == null ? isNull(switchTypes.manufacturerId) : eq(switchTypes.manufacturerId, dto.manufacturerId);
    const clash = this.db
      .select({ id: switchTypes.id })
      .from(switchTypes)
      .where(
        and(
          eq(switchTypes.name, dto.name),
          sameManufacturer,
          isNull(switchTypes.deletedAt),
          exceptId == null ? undefined : ne(switchTypes.id, exceptId),
        ),
      )
      .get();
    if (clash) throw new ConflictException('An entry with that name already exists');
  }

  protected override toRow(dto: SwitchTypeDto): Record<string, unknown> {
    return { ...super.toRow(dto), manufacturerId: dto.manufacturerId ?? null };
  }
}
