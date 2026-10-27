import { defineEnum, type EnumValue } from './enum.js';

export const PickupType = defineEnum({
  HUMBUCKER: 'Humbucker',
  SINGLE: 'Single coil',
  STACK_SINGLE: 'Stacked single coil',
  SINGLE_HUMBUCKER: 'Single-sized humbucker',
  SPECIAL: 'Special',
  PIEZO: 'Piezo',
});
export type PickupType = EnumValue<typeof PickupType>;

export const PickupPosition = defineEnum({
  BRIDGE: 'Bridge',
  MIDDLE: 'Middle',
  NECK: 'Neck',
});
export type PickupPosition = EnumValue<typeof PickupPosition>;

export const PickupActivity = defineEnum({
  ACTIVE: 'Active',
  PASSIVE: 'Passive',
});
export type PickupActivity = EnumValue<typeof PickupActivity>;

export const StringInstrument = defineEnum({
  EL_GUITAR: 'Electric guitar',
  AC_GUITAR: 'Acoustic guitar',
  BASS: 'Bass',
  BANJO: 'Banjo',
  UKULELE: 'Ukulele',
  PRIM: 'Prim',
  BRAC: 'Brač',
  BERDA: 'Berda',
});
export type StringInstrument = EnumValue<typeof StringInstrument>;

export const PickupOutput = defineEnum({
  UNKNOWN: 'Unknown',
  VINTAGE: 'Vintage',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
});
export type PickupOutput = EnumValue<typeof PickupOutput>;

export const MagneticDirection = defineEnum({
  NORTH: 'North',
  SOUTH: 'South',
  ONE_SOUTH_TWO_NORTH: '1 South – 2 North',
  ONE_NORTH_TWO_SOUTH: '1 North – 2 South',
});
export type MagneticDirection = EnumValue<typeof MagneticDirection>;

export const WindingDirection = defineEnum({
  UNKNOWN: 'Unknown',
  CW: 'Clockwise',
  CCW: 'Counter-clockwise',
});
export type WindingDirection = EnumValue<typeof WindingDirection>;

export const WindingMethod = defineEnum({
  UNKNOWN: 'Unknown',
  BY_HAND: 'By hand',
  MACHINE: 'Machine',
  SCATTER: 'Scatter wound',
});
export type WindingMethod = EnumValue<typeof WindingMethod>;

export const PottingType = defineEnum({
  WAX: 'Wax',
  BLACK_WAX: 'Black wax',
  PLASTIC: 'Plastic',
  AMBER_LACQUER: 'Amber lacquer',
});
export type PottingType = EnumValue<typeof PottingType>;

export const InsulationColor = defineEnum({
  ORANGE: 'Orange',
  PURPLE: 'Purple',
  DARK_PURPLE: 'Dark purple',
  DARK_MAROON: 'Dark maroon',
});
export type InsulationColor = EnumValue<typeof InsulationColor>;

export const ConnectionType = defineEnum({
  UNKNOWN: 'Unknown',
  PARALLEL: 'Parallel',
  SERIAL: 'Serial',
});
export type ConnectionType = EnumValue<typeof ConnectionType>;

export const CarrierType = defineEnum({
  BRASS: 'Brass',
  FORBON: 'Forbon',
  PERTINAX: 'Pertinax',
  PLASTIC: 'Plastic',
});
export type CarrierType = EnumValue<typeof CarrierType>;

export const CapMaterial = defineEnum({
  METAL: 'Metal',
  PLASTIC: 'Plastic',
  CERAMIC: 'Ceramic',
});
export type CapMaterial = EnumValue<typeof CapMaterial>;

export const InformationSource = defineEnum({
  UNKNOWN: 'Unknown',
  WEB: 'Web',
  PERSONALLY_INSPECTED: 'Personally inspected',
  DB: 'Database',
  ANOTHER_LUTHIER: 'Another luthier',
});
export type InformationSource = EnumValue<typeof InformationSource>;

export const WiringType = defineEnum({
  GUITAR_WIRING: 'Guitar wiring',
  BASS_WIRING: 'Bass wiring',
  OTHER_MISC_WIRING: 'Other / misc wiring',
  SPECIFIC: 'Specific',
});
export type WiringType = EnumValue<typeof WiringType>;

/** What a control position on the instrument is used for. */
export const ControlRole = defineEnum({
  VOLUME: 'Volume',
  TONE: 'Tone',
});
export type ControlRole = EnumValue<typeof ControlRole>;

/** Which instrument family a wiring pickup type belongs to. */
export const InstrumentFamily = defineEnum({
  GUITAR: 'Guitar',
  BASS: 'Bass',
});
export type InstrumentFamily = EnumValue<typeof InstrumentFamily>;

/** What a potentiometer does besides turning: pull-up switch, blend, … */
export const PotFunction = defineEnum({
  NORMAL: 'Normal',
  PUSH_PULL: 'Push-pull',
  PUSH_PUSH: 'Push-push',
  BLEND: 'Blend',
  STACKED: 'Stacked / concentric',
  NO_LOAD: 'No-load',
  TBX: 'TBX',
  S1_SWITCH: 'S-1 switch',
  SWITCHED: 'With switch',
});
export type PotFunction = EnumValue<typeof PotFunction>;

/** Which entity an attachment belongs to. */
export const AttachmentOwner = defineEnum({
  pickup: 'Pickup',
  wiringDiagram: 'Wiring diagram',
  pickupSet: 'Pickup set',
  potLayout: 'Pot layout',
  manufacturer: 'Manufacturer',
  switchType: 'Switch type',
});
export type AttachmentOwner = EnumValue<typeof AttachmentOwner>;

/** Everything that can be moved to the trash and restored. */
export const TrashKind = defineEnum({
  pickup: 'Pickup',
  pickupSet: 'Pickup set',
  wiringDiagram: 'Wiring diagram',
  manufacturer: 'Manufacturer',
  potentiometerType: 'Potentiometer type',
  switchType: 'Switch type',
  wiringPickupType: 'Pickup type',
  potLayout: 'Pot layout',
});
export type TrashKind = EnumValue<typeof TrashKind>;
