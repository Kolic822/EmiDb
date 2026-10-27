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
  PottingType,
  StringInstrument,
  WindingDirection,
  WindingMethod,
  WiringPickupType,
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
}

/** A lookup value such as "500k audio taper" or "5-way blade". */
export interface ComponentType extends Timestamps {
  id: number;
  name: string;
  description: string | null;
}
export type PotentiometerType = ComponentType;
export type SwitchType = ComponentType;

export interface WiringDiagram extends Timestamps {
  id: number;
  name: string;
  manufacturerId: number | null;
  manufacturerName: string | null;
  wiringType: WiringType | null;
  pickupCount: number | null;
  neck: WiringPickupType | null;
  middle: WiringPickupType | null;
  bridge: WiringPickupType | null;
  /** Potentiometer type ids, in order. */
  volumePots: number[];
  tonePots: number[];
  /** Switch type ids, in order. */
  switches: number[];
  phaseReversible: boolean | null;
  splitCoil: boolean | null;
  serial: boolean | null;
  parallel: boolean | null;
  description: string | null;
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
export type PickupInput = Writable<Pickup, 'manufacturerName'>;
export type PickupSetInput = Writable<
  PickupSet,
  'manufacturerName' | 'neckName' | 'middleName' | 'bridgeName'
>;
export type ComponentTypeInput = Writable<ComponentType, never>;
export type WiringDiagramInput = Writable<WiringDiagram, 'manufacturerName'>;
export type AttachmentInput = Pick<Attachment, 'caption'>;
