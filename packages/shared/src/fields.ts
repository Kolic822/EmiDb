import type { EnumDef } from './enum.js';
import {
  CapMaterial,
  CarrierType,
  ConnectionType,
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
  WiringPickupType,
  WiringType,
} from './enums.js';
import type { ComponentType, Manufacturer, Pickup, PickupSet, WiringDiagram } from './models.js';

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
  | 'switchType';

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
  label: string;
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
  /** Spans the whole section width. */
  fullWidth?: boolean;
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
  { key: 'manufacturerId', label: 'Manufacturer', group: 'identity', kind: 'manufacturer', defaultColumn: true },
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
  { key: 'manufacturerId', label: 'Manufacturer', group: 'identity', kind: 'manufacturer', defaultColumn: true },
  { key: 'neckId', label: 'Neck', group: 'pickups', kind: 'pickup', defaultColumn: true },
  { key: 'middleId', label: 'Middle', group: 'pickups', kind: 'pickup', defaultColumn: true },
  { key: 'bridgeId', label: 'Bridge', group: 'pickups', kind: 'pickup', defaultColumn: true },
  { key: 'description', label: 'Description', group: 'identity', kind: 'textarea', column: false, filterable: false },
];

/** Type + function fields for pot positions 1–3, shown while the count covers the position. */
function potFields(
  prefix: 'volumePot' | 'tonePot',
  label: string,
  group: 'volume' | 'tone',
  countKey: 'volumePotCount' | 'tonePotCount',
): FieldDef<WiringDiagram>[] {
  return [1, 2, 3].flatMap((n): FieldDef<WiringDiagram>[] => [
    {
      key: `${prefix}${n}TypeId` as keyof WiringDiagram & string,
      label: `${label} ${n}`,
      group,
      kind: 'potentiometerType',
      showWhen: { key: countKey, min: n },
    },
    {
      key: `${prefix}${n}Function` as keyof WiringDiagram & string,
      label: `${label} ${n} function`,
      group,
      kind: 'enum',
      enumDef: PotFunction,
      showWhen: { key: countKey, min: n },
    },
  ]);
}

export const WIRING_DIAGRAM_GROUPS: FieldGroup[] = [
  { id: 'identity', label: 'Diagram' },
  { id: 'pickups', label: 'Pickups' },
  { id: 'volume', label: 'Volume pots', width: 'half', columns: 2 },
  { id: 'tone', label: 'Tone pots', width: 'half', columns: 2 },
  { id: 'switches', label: 'Switches' },
  { id: 'options', label: 'Wiring options' },
];

export const WIRING_DIAGRAM_FIELDS: FieldDef<WiringDiagram>[] = [
  { key: 'name', label: 'Name', group: 'identity', kind: 'text', required: true, defaultColumn: true },
  { key: 'manufacturerId', label: 'Manufacturer', group: 'identity', kind: 'manufacturer', defaultColumn: true },
  { key: 'wiringType', label: 'Wiring type', group: 'identity', kind: 'enum', enumDef: WiringType, defaultColumn: true },
  { key: 'pickupCount', label: 'Pickups', group: 'pickups', kind: 'integer', min: 1, max: 3, defaultColumn: true },
  { key: 'neck', label: 'Neck', group: 'pickups', kind: 'enum', enumDef: WiringPickupType, defaultColumn: true },
  { key: 'middle', label: 'Middle', group: 'pickups', kind: 'enum', enumDef: WiringPickupType, defaultColumn: true },
  { key: 'bridge', label: 'Bridge', group: 'pickups', kind: 'enum', enumDef: WiringPickupType, defaultColumn: true },
  { key: 'volumePotCount', label: 'Volume pots', group: 'volume', kind: 'integer', min: 0, max: 3, defaultColumn: true, fullWidth: true },
  ...potFields('volumePot', 'Volume pot', 'volume', 'volumePotCount'),
  { key: 'tonePotCount', label: 'Tone pots', group: 'tone', kind: 'integer', min: 0, max: 3, defaultColumn: true, fullWidth: true },
  ...potFields('tonePot', 'Tone pot', 'tone', 'tonePotCount'),
  { key: 'switches', label: 'Switches', group: 'switches', kind: 'switchType', multiple: true, defaultColumn: true },
  { key: 'phaseReversible', label: 'Phase reversible', group: 'options', kind: 'boolean' },
  { key: 'splitCoil', label: 'Split coil', group: 'options', kind: 'boolean' },
  { key: 'serial', label: 'Serial', group: 'options', kind: 'boolean' },
  { key: 'parallel', label: 'Parallel', group: 'options', kind: 'boolean' },
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

/** Whether a field applies to this row (see `FieldDef.showWhen`). */
export function isFieldRelevant<T extends object>(field: FieldDef<T>, row: Partial<T> | null | undefined): boolean {
  if (!field.showWhen) return true;
  const value = row?.[field.showWhen.key];
  return typeof value === 'number' && value >= field.showWhen.min;
}

export function isNumericField(field: FieldDef<any>): boolean {
  return field.kind === 'number' || field.kind === 'integer';
}

export function isLookupField(field: FieldDef<any>): boolean {
  return (
    field.kind === 'manufacturer' ||
    field.kind === 'pickup' ||
    field.kind === 'potentiometerType' ||
    field.kind === 'switchType'
  );
}
