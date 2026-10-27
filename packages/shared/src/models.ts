import type {
  AttachmentOwner,
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
export type SwitchType = ComponentType;

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
  /** How many volume / tone pots the diagram has (1–3); the positional fields below follow. */
  volumePotCount: number | null;
  volumePot1TypeId: number | null;
  volumePot1Function: PotFunction | null;
  volumePot2TypeId: number | null;
  volumePot2Function: PotFunction | null;
  volumePot3TypeId: number | null;
  volumePot3Function: PotFunction | null;
  tonePotCount: number | null;
  tonePot1TypeId: number | null;
  tonePot1Function: PotFunction | null;
  tonePot2TypeId: number | null;
  tonePot2Function: PotFunction | null;
  tonePot3TypeId: number | null;
  tonePot3Function: PotFunction | null;
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
export type WiringPickupTypeInput = Writable<WiringPickupType, never>;
export type WiringDiagramInput = Writable<WiringDiagram, 'manufacturerName' | 'attachments'>;
export type AttachmentInput = Pick<Attachment, 'caption'>;
