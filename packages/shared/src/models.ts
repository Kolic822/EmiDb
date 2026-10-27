import type {
  AttachmentOwner,
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

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface Manufacturer extends Timestamps {
  id: number;
  name: string;
  country: string | null;
  website: string | null;
  notes: string | null;
}

export interface Pickup extends Timestamps {
  id: number;
  // Identity
  name: string;
  manufacturerId: number | null;
  /** Denormalised for display, sorting and filtering. */
  manufacturerName: string | null;
  year: number | null;
  type: PickupType | null;
  position: PickupPosition | null;
  activity: PickupActivity | null;
  instrument: StringInstrument | null;
  stringCount: number | null;
  // Electrical
  resistance: number | null;
  coilTapAt: number | null;
  inductance: number | null;
  gauss: number | null;
  tesla: number | null;
  output: PickupOutput | null;
  outputMv: number | null;
  balanced: boolean | null;
  // Magnet & coil
  magneticDirection: MagneticDirection | null;
  magnetCount: number | null;
  firstCoilWinds: number | null;
  secondCoilWinds: number | null;
  windingDirection: WindingDirection | null;
  windingMethod: WindingMethod | null;
  magnetType: string | null;
  potted: boolean | null;
  pottingType: PottingType | null;
  // Wiring
  wireType: string | null;
  insulationType: string | null;
  insulationColor: InsulationColor | null;
  connectionType: ConnectionType | null;
  separable: boolean | null;
  outputWireCount: number | null;
  adjustableCore: boolean | null;
  // Construction, source & notes
  carrierType: CarrierType | null;
  capMaterial: CapMaterial | null;
  informationSource: InformationSource | null;
  sourceMark: number | null;
  webLink: string | null;
  autocadLink: string | null;
  description: string | null;
  attachments: Attachment[];
}

export interface PickupSet extends Timestamps {
  id: number;
  name: string;
  manufacturerId: number | null;
  manufacturerName: string | null;
  neckId: number | null;
  neckName: string | null;
  middleId: number | null;
  middleName: string | null;
  bridgeId: number | null;
  bridgeName: string | null;
  description: string | null;
  attachments: Attachment[];
}

/** A lookup value such as "500k audio taper" or "5-way blade". */
export interface ComponentType extends Timestamps {
  id: number;
  name: string;
  description: string | null;
}
export type PotentiometerType = ComponentType;

export interface SwitchType extends ComponentType {
  manufacturerId: number | null;
}

/** A named arrangement of pot positions, e.g. "Les Paul": volume, volume, tone, tone. */
export interface PotLayout extends Timestamps {
  id: number;
  name: string;
  /** Role of each position, position 1 first. */
  roles: ControlRole[];
  description: string | null;
  /** Sketch of the control layout, numbered as the positions. */
  attachments: Attachment[];
}

/** Pickup shape/kind used in wiring diagram slots, e.g. "Humbucker", "P90", "Jazz Bass". */
export interface WiringPickupType extends Timestamps {
  id: number;
  name: string;
  instrument: InstrumentFamily | null;
  description: string | null;
}

export interface WiringDiagram extends Timestamps {
  id: number;
  name: string;
  manufacturerId: number | null;
  manufacturerName: string | null;
  wiringType: WiringType | null;
  pickupCount: number | null;
  neckTypeId: number | null;
  middleTypeId: number | null;
  bridgeTypeId: number | null;
  /** Number of pot positions (1–6), numbered as on the instrument; the positional fields below follow. */
  controlCount: number | null;
  control1Role: ControlRole | null;
  control1TypeId: number | null;
  control1Function: PotFunction | null;
  control2Role: ControlRole | null;
  control2TypeId: number | null;
  control2Function: PotFunction | null;
  control3Role: ControlRole | null;
  control3TypeId: number | null;
  control3Function: PotFunction | null;
  control4Role: ControlRole | null;
  control4TypeId: number | null;
  control4Function: PotFunction | null;
  control5Role: ControlRole | null;
  control5TypeId: number | null;
  control5Function: PotFunction | null;
  control6Role: ControlRole | null;
  control6TypeId: number | null;
  control6Function: PotFunction | null;
  /** Switch type ids, in order. */
  switches: number[];
  phaseReversible: boolean | null;
  splitCoil: boolean | null;
  /** How the coils are wired together. */
  connection: ConnectionType | null;
  description: string | null;
  attachments: Attachment[];
}

export interface Attachment {
  id: number;
  owner: AttachmentOwner;
  ownerId: number;
  fileName: string;
  mimeType: string;
  size: number;
  caption: string | null;
  createdAt: string;
  /** Relative API URL that streams the file. */
  url: string;
}

type Writable<T, Derived extends keyof T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | Derived>;

export type ManufacturerInput = Writable<Manufacturer, never>;
export type PickupInput = Writable<Pickup, 'manufacturerName' | 'attachments'>;
export type PickupSetInput = Writable<
  PickupSet,
  'manufacturerName' | 'neckName' | 'middleName' | 'bridgeName' | 'attachments'
>;
export type ComponentTypeInput = Writable<ComponentType, never>;
export type SwitchTypeInput = Writable<SwitchType, never>;
export type WiringPickupTypeInput = Writable<WiringPickupType, never>;
export type PotLayoutInput = Writable<PotLayout, 'attachments'>;
export type WiringDiagramInput = Writable<WiringDiagram, 'manufacturerName' | 'attachments'>;
export type AttachmentInput = Pick<Attachment, 'caption'>;
