import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: text()
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text()
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
};

/** Deleted rows stay in the table (hidden) until they are purged from the trash. */
const softDelete = { deletedAt: text() };

const id = () => integer().primaryKey({ autoIncrement: true });
const bool = () => integer({ mode: 'boolean' });

export const manufacturers = sqliteTable(
  'manufacturers',
  {
    id: id(),
    name: text().notNull(),
    country: text(),
    website: text(),
    notes: text(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex('manufacturers_name_unique')
      .on(table.name)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export const pickups = sqliteTable(
  'pickups',
  {
    id: id(),
    name: text().notNull(),
    manufacturerId: integer().references(() => manufacturers.id, {
      onDelete: 'set null',
    }),
    year: integer(),
    type: text(),
    position: text(),
    activity: text(),
    instrument: text(),
    stringCount: integer(),
    resistance: real(),
    coilTapAt: real(),
    inductance: real(),
    gauss: real(),
    tesla: real(),
    output: text(),
    outputMv: real(),
    balanced: bool(),
    magneticDirection: text(),
    magnetCount: integer(),
    firstCoilWinds: integer(),
    secondCoilWinds: integer(),
    windingDirection: text(),
    windingMethod: text(),
    magnetType: text(),
    potted: bool(),
    pottingType: text(),
    wireType: text(),
    insulationType: text(),
    insulationColor: text(),
    connectionType: text(),
    separable: bool(),
    outputWireCount: integer(),
    adjustableCore: bool(),
    carrierType: text(),
    capMaterial: text(),
    informationSource: text(),
    sourceMark: integer(),
    webLink: text(),
    autocadLink: text(),
    description: text(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [index('pickups_manufacturer_idx').on(table.manufacturerId)],
);

export const pickupSets = sqliteTable('pickup_sets', {
  id: id(),
  name: text().notNull(),
  manufacturerId: integer().references(() => manufacturers.id, {
    onDelete: 'set null',
  }),
  neckId: integer().references(() => pickups.id, { onDelete: 'set null' }),
  middleId: integer().references(() => pickups.id, { onDelete: 'set null' }),
  bridgeId: integer().references(() => pickups.id, { onDelete: 'set null' }),
  description: text(),
  ...timestamps,
  ...softDelete,
});

export const potentiometerTypes = sqliteTable(
  'potentiometer_types',
  {
    id: id(),
    name: text().notNull(),
    description: text(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex('potentiometer_types_name_unique')
      .on(table.name)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export const switchTypes = sqliteTable(
  'switch_types',
  {
    id: id(),
    name: text().notNull(),
    manufacturerId: integer().references(() => manufacturers.id, {
      onDelete: 'set null',
    }),
    description: text(),
    ...timestamps,
    ...softDelete,
  },
  // The same switch model can come from several manufacturers.
  (table) => [
    uniqueIndex('switch_types_name_manufacturer_unique')
      .on(table.name, table.manufacturerId)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export const potLayouts = sqliteTable(
  'pot_layouts',
  {
    id: id(),
    name: text().notNull(),
    /** JSON array of control roles, position 1 first. */
    roles: text({ mode: 'json' }).$type<string[]>().notNull(),
    description: text(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex('pot_layouts_name_unique')
      .on(table.name)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export const wiringPickupTypes = sqliteTable(
  'wiring_pickup_types',
  {
    id: id(),
    name: text().notNull(),
    instrument: text(),
    description: text(),
    ...timestamps,
    ...softDelete,
  },
  (table) => [
    uniqueIndex('wiring_pickup_types_name_unique')
      .on(table.name)
      .where(sql`${table.deletedAt} is null`),
  ],
);

export const wiringDiagrams = sqliteTable('wiring_diagrams', {
  id: id(),
  name: text().notNull(),
  manufacturerId: integer().references(() => manufacturers.id, {
    onDelete: 'set null',
  }),
  wiringType: text(),
  pickupCount: integer(),
  neckTypeId: integer().references(() => wiringPickupTypes.id, {
    onDelete: 'set null',
  }),
  middleTypeId: integer().references(() => wiringPickupTypes.id, {
    onDelete: 'set null',
  }),
  bridgeTypeId: integer().references(() => wiringPickupTypes.id, {
    onDelete: 'set null',
  }),
  controlCount: integer(),
  control1Role: text(),
  control1TypeId: integer().references(() => potentiometerTypes.id, {
    onDelete: 'set null',
  }),
  control1Function: text(),
  control2Role: text(),
  control2TypeId: integer().references(() => potentiometerTypes.id, {
    onDelete: 'set null',
  }),
  control2Function: text(),
  control3Role: text(),
  control3TypeId: integer().references(() => potentiometerTypes.id, {
    onDelete: 'set null',
  }),
  control3Function: text(),
  control4Role: text(),
  control4TypeId: integer().references(() => potentiometerTypes.id, {
    onDelete: 'set null',
  }),
  control4Function: text(),
  control5Role: text(),
  control5TypeId: integer().references(() => potentiometerTypes.id, {
    onDelete: 'set null',
  }),
  control5Function: text(),
  control6Role: text(),
  control6TypeId: integer().references(() => potentiometerTypes.id, {
    onDelete: 'set null',
  }),
  control6Function: text(),
  phaseReversible: bool(),
  splitCoil: bool(),
  connection: text(),
  description: text(),
  ...timestamps,
  ...softDelete,
});

export const wiringDiagramSwitches = sqliteTable(
  'wiring_diagram_switches',
  {
    id: id(),
    diagramId: integer()
      .notNull()
      .references(() => wiringDiagrams.id, { onDelete: 'cascade' }),
    switchTypeId: integer()
      .notNull()
      .references(() => switchTypes.id, { onDelete: 'cascade' }),
    position: integer().notNull(),
  },
  (table) => [index('wiring_diagram_switches_diagram_idx').on(table.diagramId)],
);

export const attachments = sqliteTable(
  'attachments',
  {
    id: id(),
    owner: text({
      enum: ['pickup', 'wiringDiagram', 'pickupSet', 'potLayout', 'manufacturer', 'switchType'],
    }).notNull(),
    ownerId: integer().notNull(),
    fileName: text().notNull(),
    storedName: text().notNull().unique(),
    mimeType: text().notNull(),
    size: integer().notNull(),
    caption: text(),
    createdAt: timestamps.createdAt,
  },
  (table) => [index('attachments_owner_idx').on(table.owner, table.ownerId)],
);
