import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamps = {
  createdAt: text()
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text()
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
};

const id = () => integer().primaryKey({ autoIncrement: true });
const bool = () => integer({ mode: 'boolean' });

export const manufacturers = sqliteTable('manufacturers', {
  id: id(),
  name: text().notNull().unique(),
  country: text(),
  website: text(),
  notes: text(),
  ...timestamps,
});

export const pickups = sqliteTable(
  'pickups',
  {
    id: id(),
    name: text().notNull(),
    manufacturerId: integer().references(() => manufacturers.id, { onDelete: 'set null' }),
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
  },
  (table) => [index('pickups_manufacturer_idx').on(table.manufacturerId)],
);

export const pickupSets = sqliteTable('pickup_sets', {
  id: id(),
  name: text().notNull(),
  manufacturerId: integer().references(() => manufacturers.id, { onDelete: 'set null' }),
  neckId: integer().references(() => pickups.id, { onDelete: 'set null' }),
  middleId: integer().references(() => pickups.id, { onDelete: 'set null' }),
  bridgeId: integer().references(() => pickups.id, { onDelete: 'set null' }),
  description: text(),
  ...timestamps,
});

export const potentiometerTypes = sqliteTable('potentiometer_types', {
  id: id(),
  name: text().notNull().unique(),
  description: text(),
  ...timestamps,
});

export const switchTypes = sqliteTable('switch_types', {
  id: id(),
  name: text().notNull().unique(),
  description: text(),
  ...timestamps,
});

export const wiringDiagrams = sqliteTable('wiring_diagrams', {
  id: id(),
  name: text().notNull(),
  manufacturerId: integer().references(() => manufacturers.id, { onDelete: 'set null' }),
  wiringType: text(),
  pickupCount: integer(),
  neck: text(),
  middle: text(),
  bridge: text(),
  volumePotCount: integer(),
  volumePot1TypeId: integer().references(() => potentiometerTypes.id, { onDelete: 'set null' }),
  volumePot1Function: text(),
  volumePot2TypeId: integer().references(() => potentiometerTypes.id, { onDelete: 'set null' }),
  volumePot2Function: text(),
  volumePot3TypeId: integer().references(() => potentiometerTypes.id, { onDelete: 'set null' }),
  volumePot3Function: text(),
  tonePotCount: integer(),
  tonePot1TypeId: integer().references(() => potentiometerTypes.id, { onDelete: 'set null' }),
  tonePot1Function: text(),
  tonePot2TypeId: integer().references(() => potentiometerTypes.id, { onDelete: 'set null' }),
  tonePot2Function: text(),
  tonePot3TypeId: integer().references(() => potentiometerTypes.id, { onDelete: 'set null' }),
  tonePot3Function: text(),
  phaseReversible: bool(),
  splitCoil: bool(),
  connection: text(),
  description: text(),
  ...timestamps,
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
    owner: text({ enum: ['pickup', 'wiringDiagram', 'pickupSet'] }).notNull(),
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
