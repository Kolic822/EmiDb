import type { EnumDef } from './enum.js';
import {
  CapMaterial,
  CarrierType,
  ConnectionType,
  ControlRole,
  InformationSource,
  InsulationColor,
  MagneticDirection,
  PickupActivity,
  PickupOutput,
  PickupPosition,
  PickupType,
  PotFunction,
  PottingType,
  StringInstrument,
  WindingDirection,
  WindingMethod,
  InstrumentFamily,
  WiringType,
} from './enums.js';
import type {
  ComponentType,
  Manufacturer,
  Pickup,
  PickupSet,
  PotLayout,
  SwitchType,
  WiringDiagram,
  WiringPickupType,
} from './models.js';
import { t } from './i18n/i18n.js';

/**
 * Field metadata drives tables, forms, filters and the compare view,
 * so every entity describes its fields exactly once.
 */
export type FieldKind =
  | 'text'
  | 'textarea'
  | 'url'
  | 'number'
  | 'integer'
  | 'enum'
  | 'boolean'
  | 'manufacturer'
  | 'pickup'
  | 'potentiometerType'
  | 'switchType'
  | 'wiringPickupType'
  | 'potLayout';

export interface FieldGroup {
  id: string;
  label: string;
  /** Half-width sections sit side by side in forms and detail views. */
  width?: 'full' | 'half';
  /** Fixed number of field columns inside the section (default: as many as fit). */
  columns?: number;
}

export interface FieldDef<T = Record<string, unknown>> {
  key: keyof T & string;
  /** English source label; translated through `fieldLabel()`. May contain `{placeholders}`. */
  label: string;
  labelParams?: Record<string, string | number>;
  group: string;
  kind: FieldKind;
  unit?: string;
  enumDef?: EnumDef;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  /** Repeated lookup (e.g. several volume pots). */
  multiple?: boolean;
  /** Shown in the table by default. */
  defaultColumn?: boolean;
  /** Can be used as a table column at all. */
  column?: boolean;
  /** Offered in the filter view. */
  filterable?: boolean;
  /** Only relevant (shown in forms and details) while another field is at least `min`. */
  showWhen?: { key: keyof T & string; min: number };
  /** Filtered by an exact value only (no ± tolerance), e.g. a count of pots. */
  exact?: boolean;
  /** Spans the whole section width. */
  fullWidth?: boolean;
  /** Number of grid columns to span in a fixed-column section. */
  span?: number;
  /** Same as `span`, but only in read-only detail views (where hidden helper fields leave gaps). */
  detailsSpan?: number;
  /** Lookup that offers "Add new…" directly in the dropdown. */
  creatable?: boolean;
  /** Filter by one value instead of "any of" (e.g. the type at one pot position). */
  filterSingle?: boolean;
  /** Lookup options are narrowed by another field of the same record (see `lookupMatches`). */
  dependsOn?: keyof T & string;
  /** Form-only helper that is never stored, shown as a column or filtered. */
  transient?: boolean;
}

export const PICKUP_GROUPS: FieldGroup[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'electrical', label: 'Electrical' },
  { id: 'magnet', label: 'Magnet & coil' },
  { id: 'wiring', label: 'Wiring' },
  { id: 'info', label: 'Construction & source' },
];

export const PICKUP_FIELDS: FieldDef<Pickup>[] = [
  { key: 'name', label: 'Name', group: 'identity', kind: 'text', required: true, defaultColumn: true },
  { key: 'manufacturerId', label: 'Manufacturer', group: 'identity', kind: 'manufacturer', defaultColumn: true, creatable: true },
  { key: 'year', label: 'Year', group: 'identity', kind: 'integer', min: 1900, max: 2100, defaultColumn: true },
  { key: 'type', label: 'Type', group: 'identity', kind: 'enum', enumDef: PickupType, defaultColumn: true },
  { key: 'position', label: 'Position', group: 'identity', kind: 'enum', enumDef: PickupPosition, defaultColumn: true },
  { key: 'activity', label: 'Activity', group: 'identity', kind: 'enum', enumDef: PickupActivity },
  { key: 'instrument', label: 'Instrument', group: 'identity', kind: 'enum', enumDef: StringInstrument, defaultColumn: true },
  { key: 'stringCount', label: 'Strings', group: 'identity', kind: 'integer', min: 1, max: 12, defaultColumn: true },

  { key: 'resistance', label: 'Resistance', group: 'electrical', kind: 'number', unit: 'kΩ', step: 0.01, defaultColumn: true },
  { key: 'coilTapAt', label: 'Coil tap at', group: 'electrical', kind: 'number', unit: 'kΩ', step: 0.01 },
  { key: 'inductance', label: 'Inductance', group: 'electrical', kind: 'number', unit: 'H', step: 0.01, defaultColumn: true },
  { key: 'gauss', label: 'Gauss', group: 'electrical', kind: 'number', unit: 'G', step: 1 },
  { key: 'tesla', label: 'Tesla', group: 'electrical', kind: 'number', unit: 'T', step: 0.0001 },
  { key: 'output', label: 'Output', group: 'electrical', kind: 'enum', enumDef: PickupOutput, defaultColumn: true },
  { key: 'outputMv', label: 'Output', group: 'electrical', kind: 'number', unit: 'mV', step: 1 },
  { key: 'balanced', label: 'Balanced', group: 'electrical', kind: 'boolean' },

  { key: 'magneticDirection', label: 'Magnetic direction', group: 'magnet', kind: 'enum', enumDef: MagneticDirection },
  { key: 'magnetCount', label: 'Magnets', group: 'magnet', kind: 'integer', min: 0, max: 24 },
  { key: 'firstCoilWinds', label: '1st coil winds', group: 'magnet', kind: 'integer', min: 0 },
  { key: 'secondCoilWinds', label: '2nd coil winds', group: 'magnet', kind: 'integer', min: 0 },
  { key: 'windingDirection', label: 'Winding direction', group: 'magnet', kind: 'enum', enumDef: WindingDirection },
  { key: 'windingMethod', label: 'Winding method', group: 'magnet', kind: 'enum', enumDef: WindingMethod },
  { key: 'magnetType', label: 'Magnet type', group: 'magnet', kind: 'text' },
  { key: 'potted', label: 'Potted', group: 'magnet', kind: 'boolean' },
  { key: 'pottingType', label: 'Potting type', group: 'magnet', kind: 'enum', enumDef: PottingType },

  { key: 'wireType', label: 'Wire type', group: 'wiring', kind: 'text' },
  { key: 'insulationType', label: 'Insulation type', group: 'wiring', kind: 'text' },
  { key: 'insulationColor', label: 'Insulation colour', group: 'wiring', kind: 'enum', enumDef: InsulationColor },
  { key: 'connectionType', label: 'Connection', group: 'wiring', kind: 'enum', enumDef: ConnectionType },
  { key: 'separable', label: 'Separable', group: 'wiring', kind: 'boolean' },
  { key: 'outputWireCount', label: 'Output wires', group: 'wiring', kind: 'integer', min: 1, max: 6 },
  { key: 'adjustableCore', label: 'Adjustable core', group: 'wiring', kind: 'boolean' },

  { key: 'carrierType', label: 'Carrier type', group: 'info', kind: 'enum', enumDef: CarrierType },
  { key: 'capMaterial', label: 'Cap material', group: 'info', kind: 'enum', enumDef: CapMaterial },
  { key: 'informationSource', label: 'Information source', group: 'info', kind: 'enum', enumDef: InformationSource },
  { key: 'sourceMark', label: 'Source reliability', group: 'info', kind: 'integer', min: 1, max: 10 },
  { key: 'webLink', label: 'Web link', group: 'info', kind: 'url', filterable: false },
  { key: 'autocadLink', label: 'AutoCAD link', group: 'info', kind: 'url', filterable: false },
  { key: 'description', label: 'Description', group: 'info', kind: 'textarea', column: false, filterable: false },
];

export const PICKUP_SET_GROUPS: FieldGroup[] = [
  { id: 'identity', label: 'Set' },
  { id: 'pickups', label: 'Pickups' },
];

export const PICKUP_SET_FIELDS: FieldDef<PickupSet>[] = [
  { key: 'name', label: 'Name', group: 'identity', kind: 'text', required: true, defaultColumn: true },
  { key: 'manufacturerId', label: 'Manufacturer', group: 'identity', kind: 'manufacturer', defaultColumn: true, creatable: true },
  { key: 'neckId', label: 'Neck', group: 'pickups', kind: 'pickup', defaultColumn: true },
  { key: 'middleId', label: 'Middle', group: 'pickups', kind: 'pickup', defaultColumn: true },
  { key: 'bridgeId', label: 'Bridge', group: 'pickups', kind: 'pickup', defaultColumn: true },
  { key: 'description', label: 'Description', group: 'identity', kind: 'textarea', column: false, filterable: false },
];

export const MAX_CONTROLS = 6;

/** Role + type + function for pot positions 1–6, shown while the count covers the position. */
function controlFields(): FieldDef<WiringDiagram>[] {
  return Array.from({ length: MAX_CONTROLS }, (_, i) => i + 1).flatMap((n): FieldDef<WiringDiagram>[] => [
    {
      key: `control${n}Role` as keyof WiringDiagram & string,
      label: 'Pot {n}',
      labelParams: { n },
      group: 'controls',
      kind: 'enum',
      enumDef: ControlRole,
      filterSingle: true,
      showWhen: { key: 'controlCount', min: n },
    },
    {
      key: `control${n}TypeId` as keyof WiringDiagram & string,
      label: 'Pot {n} type',
      labelParams: { n },
      group: 'controls',
      kind: 'potentiometerType',
      creatable: true,
      filterSingle: true,
      showWhen: { key: 'controlCount', min: n },
    },
    {
      key: `control${n}Function` as keyof WiringDiagram & string,
      label: 'Pot {n} function',
      labelParams: { n },
      group: 'controls',
      kind: 'enum',
      enumDef: PotFunction,
      filterSingle: true,
      showWhen: { key: 'controlCount', min: n },
    },
  ]);
}

/** Layouts every database starts with; the user can add more. */
export const DEFAULT_POT_LAYOUTS: { name: string; roles: ControlRole[] }[] = [
  { name: '1 volume', roles: ['VOLUME'] },
  { name: 'Volume + tone', roles: ['VOLUME', 'TONE'] },
  { name: 'Volume + 2 tones (Strat)', roles: ['VOLUME', 'TONE', 'TONE'] },
  { name: '2 volumes + tone (Jazz Bass)', roles: ['VOLUME', 'VOLUME', 'TONE'] },
  { name: '2 volumes + 2 tones (Les Paul)', roles: ['VOLUME', 'VOLUME', 'TONE', 'TONE'] },
  { name: '3 volumes + tone', roles: ['VOLUME', 'VOLUME', 'VOLUME', 'TONE'] },
];

export const POT_LAYOUT_GROUPS: FieldGroup[] = [{ id: 'main', label: 'Pot layout' }];

export const POT_LAYOUT_FIELDS: FieldDef<PotLayout>[] = [
  { key: 'name', label: 'Name', group: 'main', kind: 'text', required: true, defaultColumn: true, fullWidth: true },
  { key: 'roles', label: 'Positions', group: 'main', kind: 'enum', enumDef: ControlRole, multiple: true, defaultColumn: true, filterable: false },
  { key: 'description', label: 'Description', group: 'main', kind: 'text', defaultColumn: true, fullWidth: true },
];

export const WIRING_DIAGRAM_GROUPS: FieldGroup[] = [
  { id: 'identity', label: 'Diagram' },
  { id: 'pickups', label: 'Pickups' },
  { id: 'controls', label: 'Pots', columns: 3 },
  { id: 'switches', label: 'Switches' },
  { id: 'options', label: 'Wiring options' },
];

export const WIRING_DIAGRAM_FIELDS: FieldDef<WiringDiagram>[] = [
  { key: 'name', label: 'Name', group: 'identity', kind: 'text', required: true, defaultColumn: true },
  { key: 'manufacturerId', label: 'Manufacturer', group: 'identity', kind: 'manufacturer', defaultColumn: true, creatable: true },
  { key: 'wiringType', label: 'Wiring type', group: 'identity', kind: 'enum', enumDef: WiringType, defaultColumn: true },
  { key: 'pickupCount', label: 'No. of pickups', group: 'pickups', kind: 'integer', min: 1, max: 3, defaultColumn: true },
  { key: 'neckTypeId', label: 'Neck', group: 'pickups', kind: 'wiringPickupType', creatable: true, dependsOn: 'wiringType', defaultColumn: true },
  { key: 'middleTypeId', label: 'Middle', group: 'pickups', kind: 'wiringPickupType', creatable: true, dependsOn: 'wiringType', defaultColumn: true },
  { key: 'bridgeTypeId', label: 'Bridge', group: 'pickups', kind: 'wiringPickupType', creatable: true, dependsOn: 'wiringType', defaultColumn: true },
  { key: 'layout' as keyof WiringDiagram & string, label: 'Layout', group: 'controls', kind: 'potLayout', transient: true, span: 2 },
  { key: 'controlCount', label: 'No. of pots', group: 'controls', kind: 'integer', min: 0, max: MAX_CONTROLS, exact: true, defaultColumn: true, detailsSpan: 3 },
  ...controlFields(),
  { key: 'switches', label: 'Switches', group: 'switches', kind: 'switchType', multiple: true, creatable: true, defaultColumn: true },
  { key: 'phaseReversible', label: 'Phase reversible', group: 'options', kind: 'boolean' },
  { key: 'splitCoil', label: 'Split coil', group: 'options', kind: 'boolean' },
  { key: 'connection', label: 'Coil connection', group: 'options', kind: 'enum', enumDef: ConnectionType },
  { key: 'description', label: 'Description', group: 'identity', kind: 'textarea', column: false, filterable: false },
];

export const MANUFACTURER_GROUPS: FieldGroup[] = [{ id: 'main', label: 'Manufacturer' }];

export const MANUFACTURER_FIELDS: FieldDef<Manufacturer>[] = [
  { key: 'name', label: 'Name', group: 'main', kind: 'text', required: true, defaultColumn: true },
  { key: 'country', label: 'Country', group: 'main', kind: 'text', defaultColumn: true },
  { key: 'website', label: 'Website', group: 'main', kind: 'url', defaultColumn: true },
  { key: 'notes', label: 'Notes', group: 'main', kind: 'textarea', column: false, filterable: false },
];

export const COMPONENT_TYPE_GROUPS: FieldGroup[] = [{ id: 'main', label: 'Type' }];

export const COMPONENT_TYPE_FIELDS: FieldDef<ComponentType>[] = [
  { key: 'name', label: 'Name', group: 'main', kind: 'text', required: true, defaultColumn: true },
  { key: 'description', label: 'Description', group: 'main', kind: 'text', defaultColumn: true },
];

export const SWITCH_TYPE_FIELDS: FieldDef<SwitchType>[] = [
  { key: 'name', label: 'Name', group: 'main', kind: 'text', required: true, defaultColumn: true },
  { key: 'manufacturerId', label: 'Manufacturer', group: 'main', kind: 'manufacturer', creatable: true, defaultColumn: true },
  { key: 'description', label: 'Description', group: 'main', kind: 'text', defaultColumn: true },
];

/** Translated label of a field. */
export function fieldLabel(field: FieldDef<any>): string {
  return t(field.label, field.labelParams);
}

/** Translated label of a field group. */
export function groupLabel(group: FieldGroup): string {
  return t(group.label);
}

/** Whether a field applies to this row (see `FieldDef.showWhen`). */
export function isFieldRelevant<T extends object>(field: FieldDef<T>, row: Partial<T> | null | undefined): boolean {
  if (!field.showWhen) return true;
  const value = row?.[field.showWhen.key];
  return typeof value === 'number' && value >= field.showWhen.min;
}

export const WIRING_PICKUP_TYPE_GROUPS: FieldGroup[] = [{ id: 'main', label: 'Pickup type' }];

export const WIRING_PICKUP_TYPE_FIELDS: FieldDef<WiringPickupType>[] = [
  { key: 'name', label: 'Name', group: 'main', kind: 'text', required: true, defaultColumn: true },
  { key: 'instrument', label: 'Instrument', group: 'main', kind: 'enum', enumDef: InstrumentFamily, defaultColumn: true },
  { key: 'description', label: 'Description', group: 'main', kind: 'text', defaultColumn: true },
];

/** Instrument family a wiring type applies to; null means any. */
export function instrumentForWiringType(wiringType: unknown): InstrumentFamily | null {
  if (wiringType === 'GUITAR_WIRING') return 'GUITAR';
  if (wiringType === 'BASS_WIRING') return 'BASS';
  return null;
}

/**
 * Whether a lookup entry fits the record being edited: wiring pickup types
 * are narrowed to the diagram's instrument family (guitar or bass).
 */
export function lookupMatches(
  field: FieldDef<any>,
  entry: { instrument?: InstrumentFamily | null },
  record: Partial<Record<string, unknown>> | null | undefined,
): boolean {
  if (field.kind !== 'wiringPickupType' || !field.dependsOn) return true;
  const family = instrumentForWiringType(record?.[field.dependsOn]);
  return family == null || entry.instrument == null || entry.instrument === family;
}

export function isNumericField(field: FieldDef<any>): boolean {
  return field.kind === 'number' || field.kind === 'integer';
}

export function isLookupField(field: FieldDef<any>): boolean {
  return (
    field.kind === 'manufacturer' ||
    field.kind === 'pickup' ||
    field.kind === 'potentiometerType' ||
    field.kind === 'switchType' ||
    field.kind === 'wiringPickupType' ||
    field.kind === 'potLayout'
  );
}
