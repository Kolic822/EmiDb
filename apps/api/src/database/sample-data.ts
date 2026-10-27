/**
 * Sample data: at least ten entries of every kind, with varied values so every
 * filter has something to match. Only seeds a database without pickups, and is
 * safe next to reference data the migrations already created.
 */
import { type ControlRole, DEFAULT_POT_LAYOUTS } from '@emidb/shared';
import type { Db } from './database.js';
import {
  manufacturers,
  pickupSets,
  pickups,
  potentiometerTypes,
  potLayouts,
  switchTypes,
  wiringDiagrams,
  wiringDiagramSwitches,
  wiringPickupTypes,
} from './schema.js';

/** Returns a summary, or null when the database already holds pickups. */
export function seedSampleData(db: Db): string | null {
  if (db.select({ id: pickups.id }).from(pickups).limit(1).get()) return null;

  db.insert(manufacturers)
    .values([
      { name: 'Seymour Duncan', country: 'USA', website: 'https://www.seymourduncan.com' },
      { name: 'DiMarzio', country: 'USA', website: 'https://www.dimarzio.com' },
      { name: 'Gibson', country: 'USA', website: 'https://www.gibson.com' },
      { name: 'Fender', country: 'USA', website: 'https://www.fender.com' },
      { name: 'Bare Knuckle', country: 'UK', website: 'https://www.bareknucklepickups.co.uk' },
      { name: 'EMG', country: 'USA', website: 'https://www.emgpickups.com' },
      { name: 'Lollar', country: 'USA', website: 'https://www.lollarguitars.com' },
      { name: 'Schaller', country: 'Germany', website: 'https://www.schaller.info' },
      { name: 'Suhr', country: 'USA', website: 'https://www.suhr.com' },
      { name: 'Fishman', country: 'USA', website: 'https://www.fishman.com' },
    ])
    .onConflictDoNothing()
    .run();
  const makers = db.select({ id: manufacturers.id, name: manufacturers.name }).from(manufacturers).all();
  const maker = (name: string) => makers.find((m) => m.name === name)!.id;

  const pickupRows = db
    .insert(pickups)
    .values([
      {
        name: 'SH-4 JB', manufacturerId: maker('Seymour Duncan'), year: 1974, type: 'HUMBUCKER', position: 'BRIDGE',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 16.4, inductance: 8.1, output: 'HIGH',
        outputMv: 540, magnetType: 'Alnico 5', magnetCount: 1, windingMethod: 'MACHINE', potted: true, pottingType: 'WAX',
        outputWireCount: 4, separable: true, connectionType: 'SERIAL', informationSource: 'WEB', sourceMark: 8,
        webLink: 'https://www.seymourduncan.com/single-product/jb-model',
        description: 'The classic hot bridge humbucker: scooped mids, tight lows and a bright top end.',
      },
      {
        name: "SH-2 Jazz", manufacturerId: maker('Seymour Duncan'), year: 1976, type: 'HUMBUCKER', position: 'NECK',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 7.7, inductance: 3.9, output: 'MEDIUM',
        outputMv: 290, magnetType: 'Alnico 5', potted: true, pottingType: 'WAX', outputWireCount: 4, separable: true,
        connectionType: 'SERIAL', informationSource: 'WEB', sourceMark: 8,
      },
      {
        name: 'SSL-1 Vintage Staggered', manufacturerId: maker('Seymour Duncan'), year: 1978, type: 'SINGLE',
        position: 'MIDDLE', activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 6.5, inductance: 2.4,
        output: 'VINTAGE', magnetType: 'Alnico 5', magnetCount: 6, windingMethod: 'MACHINE', potted: true, pottingType: 'WAX',
        outputWireCount: 2, carrierType: 'FORBON', informationSource: 'WEB', sourceMark: 7,
      },
      {
        name: 'Super Distortion', manufacturerId: maker('DiMarzio'), year: 1972, type: 'HUMBUCKER', position: 'BRIDGE',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 13.68, inductance: 7.5, output: 'HIGH',
        outputMv: 425, magnetType: 'Ceramic', potted: true, pottingType: 'WAX', outputWireCount: 4, separable: true,
        adjustableCore: true, connectionType: 'SERIAL', informationSource: 'WEB', sourceMark: 9,
        description: 'The first replacement humbucker ever made. Ceramic magnet, huge output.',
      },
      {
        name: 'PAF 36th Anniversary', manufacturerId: maker('DiMarzio'), year: 2008, type: 'HUMBUCKER', position: 'NECK',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 7.7, inductance: 4.4, output: 'VINTAGE',
        outputMv: 270, magnetType: 'Alnico 5', potted: false, outputWireCount: 4, separable: true, connectionType: 'SERIAL',
        informationSource: 'WEB', sourceMark: 8,
      },
      {
        name: 'Area 61', manufacturerId: maker('DiMarzio'), year: 2005, type: 'STACK_SINGLE', position: 'NECK',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 6.46, inductance: 5.2, output: 'VINTAGE',
        outputMv: 115, magnetType: 'Alnico 2', outputWireCount: 4, separable: false, informationSource: 'WEB', sourceMark: 7,
      },
      {
        name: "'57 Classic", manufacturerId: maker('Gibson'), year: 1990, type: 'HUMBUCKER', position: 'NECK',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 8.0, inductance: 4.6, output: 'VINTAGE',
        magnetType: 'Alnico 2', windingMethod: 'MACHINE', potted: true, pottingType: 'WAX', outputWireCount: 2,
        separable: false, capMaterial: 'METAL', informationSource: 'PERSONALLY_INSPECTED', sourceMark: 9,
      },
      {
        name: 'Burstbucker 3', manufacturerId: maker('Gibson'), year: 2000, type: 'HUMBUCKER', position: 'BRIDGE',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 8.3, output: 'MEDIUM', magnetType: 'Alnico 2',
        windingMethod: 'SCATTER', potted: false, outputWireCount: 2, capMaterial: 'METAL', informationSource: 'WEB', sourceMark: 7,
        description: 'Unpotted, slightly overwound and unbalanced coils for a vintage PAF character.',
      },
      {
        name: 'P-90 Soapbar', manufacturerId: maker('Gibson'), year: 1946, type: 'SINGLE', position: 'BRIDGE',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 8.2, inductance: 7.0, output: 'MEDIUM',
        magnetType: 'Alnico 5', magnetCount: 2, outputWireCount: 1, capMaterial: 'PLASTIC', informationSource: 'DB', sourceMark: 6,
      },
      {
        name: 'Custom Shop Texas Special', manufacturerId: maker('Fender'), year: 1992, type: 'SINGLE', position: 'BRIDGE',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 6.7, inductance: 2.9, output: 'MEDIUM',
        magnetType: 'Alnico 5', magnetCount: 6, windingDirection: 'CW', windingMethod: 'MACHINE', potted: true,
        pottingType: 'WAX', outputWireCount: 2, carrierType: 'FORBON', informationSource: 'WEB', sourceMark: 7,
      },
      {
        name: 'Original Precision Bass', manufacturerId: maker('Fender'), year: 1957, type: 'SINGLE', position: 'MIDDLE',
        activity: 'PASSIVE', instrument: 'BASS', stringCount: 4, resistance: 10.6, output: 'MEDIUM', magnetType: 'Alnico 5',
        magnetCount: 8, outputWireCount: 2, carrierType: 'FORBON', informationSource: 'PERSONALLY_INSPECTED', sourceMark: 9,
        description: 'Split-coil P-Bass pickup; the two halves are wired in series, hum-cancelling.',
      },
      {
        name: 'Nailbomb', manufacturerId: maker('Bare Knuckle'), year: 2004, type: 'HUMBUCKER', position: 'BRIDGE',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 14.8, inductance: 7.9, output: 'HIGH',
        magnetType: 'Alnico 5', windingMethod: 'SCATTER', potted: false, outputWireCount: 4, separable: true,
        connectionType: 'SERIAL', informationSource: 'ANOTHER_LUTHIER', sourceMark: 6,
      },
      {
        name: 'The Mule', manufacturerId: maker('Bare Knuckle'), year: 2003, type: 'HUMBUCKER', position: 'NECK',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 7.3, inductance: 4.1, output: 'VINTAGE',
        magnetType: 'Alnico 4', windingMethod: 'SCATTER', potted: false, outputWireCount: 4, separable: true,
        connectionType: 'SERIAL', informationSource: 'WEB', sourceMark: 7,
      },
      {
        name: '81', manufacturerId: maker('EMG'), year: 1979, type: 'HUMBUCKER', position: 'BRIDGE', activity: 'ACTIVE',
        instrument: 'EL_GUITAR', stringCount: 6, resistance: 10.0, inductance: 1.5, output: 'HIGH', outputMv: 1600,
        magnetType: 'Ceramic', potted: true, pottingType: 'PLASTIC', outputWireCount: 3, separable: false,
        capMaterial: 'PLASTIC', informationSource: 'WEB', sourceMark: 8,
        description: 'Active ceramic humbucker; internal preamp, 9V. Output quoted as peak.',
      },
      {
        name: '85', manufacturerId: maker('EMG'), year: 1983, type: 'HUMBUCKER', position: 'NECK', activity: 'ACTIVE',
        instrument: 'EL_GUITAR', stringCount: 6, resistance: 10.0, inductance: 1.6, output: 'HIGH', outputMv: 1300,
        magnetType: 'Alnico 5', potted: true, pottingType: 'PLASTIC', outputWireCount: 3, capMaterial: 'PLASTIC',
        informationSource: 'WEB', sourceMark: 8,
      },
      {
        name: 'Imperial Humbucker', manufacturerId: maker('Lollar'), year: 1998, type: 'HUMBUCKER', position: 'BRIDGE',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 8.4, output: 'VINTAGE', magnetType: 'Alnico 2',
        windingMethod: 'SCATTER', potted: false, outputWireCount: 2, capMaterial: 'METAL', informationSource: 'WEB', sourceMark: 7,
      },
      {
        name: 'Vintage Blackface Strat', manufacturerId: maker('Lollar'), year: 2001, type: 'SINGLE', position: 'NECK',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 6.0, inductance: 2.3, output: 'VINTAGE',
        magnetType: 'Alnico 5', magnetCount: 6, windingMethod: 'SCATTER', potted: true, pottingType: 'WAX',
        outputWireCount: 2, carrierType: 'FORBON', informationSource: 'WEB', sourceMark: 7,
      },
      {
        name: 'Fluence Modern Humbucker', manufacturerId: maker('Fishman'), year: 2013, type: 'HUMBUCKER', position: 'BRIDGE',
        activity: 'ACTIVE', instrument: 'EL_GUITAR', stringCount: 7, resistance: 3.2, inductance: 0.9, output: 'HIGH',
        outputMv: 1100, magnetType: 'Ceramic', potted: true, pottingType: 'PLASTIC', outputWireCount: 3,
        informationSource: 'WEB', sourceMark: 6,
      },
      {
        name: 'SSV Single Coil', manufacturerId: maker('Suhr'), year: 2010, type: 'SINGLE', position: 'MIDDLE',
        activity: 'PASSIVE', instrument: 'EL_GUITAR', stringCount: 6, resistance: 6.2, inductance: 2.6, output: 'MEDIUM',
        magnetType: 'Alnico 5', magnetCount: 6, windingMethod: 'MACHINE', potted: true, pottingType: 'WAX', outputWireCount: 2,
        informationSource: 'ANOTHER_LUTHIER', sourceMark: 6,
      },
      {
        name: 'Original Jazz Bass Neck', manufacturerId: maker('Fender'), year: 1960, type: 'SINGLE', position: 'NECK',
        activity: 'PASSIVE', instrument: 'BASS', stringCount: 4, resistance: 7.2, inductance: 3.1, output: 'MEDIUM',
        magnetType: 'Alnico 5', magnetCount: 4, outputWireCount: 2, carrierType: 'FORBON',
        informationSource: 'PERSONALLY_INSPECTED', sourceMark: 9,
      },
      {
        name: 'Undersaddle Piezo', manufacturerId: maker('Fishman'), year: 2008, type: 'PIEZO', position: 'BRIDGE',
        activity: 'ACTIVE', instrument: 'AC_GUITAR', stringCount: 6, output: 'LOW', outputMv: 200, outputWireCount: 2,
        informationSource: 'WEB', sourceMark: 5,
      },
    ])
    .returning({ id: pickups.id, name: pickups.name })
    .all();
  const pickup = (name: string) => pickupRows.find((p) => p.name === name)!.id;

  db.insert(pickupSets)
    .values([
      {
        name: 'Hot Rodded Humbucker Set', manufacturerId: maker('Seymour Duncan'),
        neckId: pickup("SH-2 Jazz"), bridgeId: pickup('SH-4 JB'),
        description: 'The JB / Jazz combination.',
      },
      {
        name: 'Modern Metal', manufacturerId: maker('EMG'), neckId: pickup('85'), bridgeId: pickup('81'),
      },
      {
        name: 'Vintage Strat Trio', manufacturerId: maker('Seymour Duncan'),
        neckId: pickup('SSL-1 Vintage Staggered'), middleId: pickup('SSL-1 Vintage Staggered'),
        bridgeId: pickup('Custom Shop Texas Special'),
      },
      { name: 'Classic Rock Set', manufacturerId: maker('Gibson'), neckId: pickup("'57 Classic"), bridgeId: pickup('Burstbucker 3') },
      { name: 'DiMarzio Hot Set', manufacturerId: maker('DiMarzio'), neckId: pickup('PAF 36th Anniversary'), bridgeId: pickup('Super Distortion') },
      { name: 'Bare Knuckle Modern', manufacturerId: maker('Bare Knuckle'), neckId: pickup('The Mule'), bridgeId: pickup('Nailbomb') },
      { name: 'Lollar Vintage Pair', manufacturerId: maker('Lollar'), neckId: pickup('Vintage Blackface Strat'), bridgeId: pickup('Imperial Humbucker') },
      {
        name: 'Superstrat HSS', manufacturerId: maker('Suhr'), neckId: pickup('Vintage Blackface Strat'),
        middleId: pickup('SSV Single Coil'), bridgeId: pickup('Super Distortion'),
      },
      { name: 'P-90 Soapbar Pair', manufacturerId: maker('Gibson'), neckId: pickup('P-90 Soapbar'), bridgeId: pickup('P-90 Soapbar') },
      { name: 'Fluence Seven', manufacturerId: maker('Fishman'), bridgeId: pickup('Fluence Modern Humbucker') },
    ])
    .run();

  const potSpecs = [
    { name: '250k audio', description: 'Logarithmic taper, typical for single coils' },
    { name: '500k audio', description: 'Logarithmic taper, typical for humbuckers' },
    { name: '500k linear', description: null },
    { name: '1M audio', description: null },
    { name: '500k push-pull', description: 'DPDT switch on the pot shaft' },
    { name: '25k active', description: 'For active pickups' },
    { name: '250k push-pull', description: 'Coil split on single-coil sized controls' },
    { name: '1M linear', description: null },
    { name: '100k audio', description: 'Low value for bright, low-output pickups' },
    { name: '500k no-load', description: 'Centre detent removes the pot from the circuit' },
  ];
  const existingPots = db.select({ name: potentiometerTypes.name }).from(potentiometerTypes).all();
  const missingPots = potSpecs.filter((spec) => !existingPots.some((p) => p.name === spec.name));
  if (missingPots.length) db.insert(potentiometerTypes).values(missingPots).run();
  const pots = db.select({ id: potentiometerTypes.id, name: potentiometerTypes.name }).from(potentiometerTypes).all();
  const pot = (name: string) => pots.find((p) => p.name === name)!.id;

  const EXTRA_POT_LAYOUTS: { name: string; roles: ControlRole[] }[] = [
    { name: '2 volumes', roles: ['VOLUME', 'VOLUME'] },
    { name: 'Volume + 3 tones', roles: ['VOLUME', 'TONE', 'TONE', 'TONE'] },
    { name: '2 volumes + 3 tones', roles: ['VOLUME', 'VOLUME', 'TONE', 'TONE', 'TONE'] },
    { name: '3 volumes + 3 tones', roles: ['VOLUME', 'VOLUME', 'VOLUME', 'TONE', 'TONE', 'TONE'] },
  ];
  db.insert(potLayouts)
    .values([...DEFAULT_POT_LAYOUTS, ...EXTRA_POT_LAYOUTS])
    .onConflictDoNothing()
    .run();

  const GENERIC_SWITCHES = [
    'S One', 'Three Way Blade', 'Three Way Super Switch', 'Three Way Toggle', 'Three Way Two Pole Slide',
    'Four Way Blade', 'Four Way Blade Super Switch', 'Four Pdt On On On', 'Five Way Blade', 'Five Way Blade Super Switch',
    'Five Way Rotary', 'Two Pole Five Way Rotary', 'DPDT On On', 'DPDT On Off On', 'DPDT On On On', 'SPDT On On',
    'SPDT On Off On', 'SPDT On On On', 'Free Way 3B3 01', 'Free Way 3B3 02', 'Free Way 5B5 01', 'Free Way 5B5 02',
  ];
  const switchSpecs: { name: string; manufacturerId: number | null }[] = [
    ...GENERIC_SWITCHES.map((name) => ({ name, manufacturerId: null })),
    { name: 'Three Way Blade', manufacturerId: maker('Schaller') },
    { name: 'Five Way Blade', manufacturerId: maker('Schaller') },
    { name: 'Three Way Toggle', manufacturerId: maker('Gibson') },
    { name: 'Five Way Blade', manufacturerId: maker('Fender') },
    { name: 'Four Way Blade', manufacturerId: maker('Fender') },
  ];
  const existingSwitches = db
    .select({ name: switchTypes.name, manufacturerId: switchTypes.manufacturerId })
    .from(switchTypes)
    .all();
  const missingSwitches = switchSpecs.filter(
    (spec) => !existingSwitches.some((e) => e.name === spec.name && e.manufacturerId === spec.manufacturerId),
  );
  if (missingSwitches.length) db.insert(switchTypes).values(missingSwitches).run();
  const sws = db
    .select({ id: switchTypes.id, name: switchTypes.name, manufacturerId: switchTypes.manufacturerId })
    .from(switchTypes)
    .all();
  /** Switch by name; without a manufacturer it is the generic entry. */
  const sw = (name: string, manufacturer?: string) => {
    const manufacturerId = manufacturer ? maker(manufacturer) : null;
    return sws.find((s) => s.name === name && s.manufacturerId === manufacturerId)!.id;
  };

  const GUITAR_TYPES = [
    'Active Single Coil', 'Duckbucker', 'Humbucker', 'Single Coil', 'Single Coil Humbucker', 'Stack',
    'Strat Lipstick Tube', 'Strat Lipstick Plus', 'Blackouts', 'Mandolin', 'P-Rails', 'Phat Cat', 'Danelectro',
    'Dave Mustaine', 'Duo Sonic', 'Jaguar', 'Jazzmaster', 'Mini Humbucker', 'Mustang', 'P90', 'P90 Stack',
    'Tele Humbucker', 'Piezo',
  ];
  const BASS_TYPES = [
    'Active P-Bass', 'MusicMan', 'P-Bass', 'Active Jazz Bass', 'Active Soapbar', 'Blackouts Soapbar', 'Jazz Bass',
    'Jazz Bass Stack', 'Passive Soapbar', 'Rickenbacker',
  ];
  // The migration already inserts these; keep the seed self-sufficient for older databases.
  db.insert(wiringPickupTypes)
    .values([
      ...GUITAR_TYPES.map((name) => ({ name, instrument: 'GUITAR' })),
      ...BASS_TYPES.map((name) => ({ name, instrument: 'BASS' })),
    ])
    .onConflictDoNothing()
    .run();
  const pickupTypes = db.select({ id: wiringPickupTypes.id, name: wiringPickupTypes.name }).from(wiringPickupTypes).all();
  const pickupType = (name: string) => pickupTypes.find((p) => p.name === name)!.id;

  /** Role, pot type and function for each numbered position. */
  const controls = (spec: [role: string, potName: string, fn: string][]) => {
    const out: Record<string, string | number> = { controlCount: spec.length };
    spec.forEach(([role, potName, fn], i) => {
      out[`control${i + 1}Role`] = role;
      out[`control${i + 1}TypeId`] = pot(potName);
      out[`control${i + 1}Function`] = fn;
    });
    return out as Partial<typeof wiringDiagrams.$inferInsert>;
  };

  const diagrams = db
    .insert(wiringDiagrams)
    .values([
      {
        name: 'Les Paul standard', manufacturerId: maker('Gibson'), wiringType: 'GUITAR_WIRING', pickupCount: 2,
        neckTypeId: pickupType('Humbucker'), bridgeTypeId: pickupType('Humbucker'), phaseReversible: false, splitCoil: false, connection: 'SERIAL',
        controlCount: 4, control1Role: 'VOLUME', control1TypeId: pot('500k audio'), control1Function: 'NORMAL', control2Role: 'VOLUME', control2TypeId: pot('500k audio'), control2Function: 'NORMAL', control3Role: 'TONE', control3TypeId: pot('500k audio'), control3Function: 'NORMAL', control4Role: 'TONE', control4TypeId: pot('500k audio'), control4Function: 'NORMAL',
        description: 'Two volumes, two tones, 3-way toggle. Modern wiring (tone after volume).',
      },
      {
        name: 'Stratocaster SSS', manufacturerId: maker('Fender'), wiringType: 'GUITAR_WIRING', pickupCount: 3,
        neckTypeId: pickupType('Single Coil'), middleTypeId: pickupType('Single Coil'), bridgeTypeId: pickupType('Single Coil'),
        phaseReversible: false, splitCoil: false, connection: 'PARALLEL',
        controlCount: 3, control1Role: 'VOLUME', control1TypeId: pot('250k audio'), control1Function: 'NORMAL', control2Role: 'TONE', control2TypeId: pot('250k audio'), control2Function: 'NORMAL', control3Role: 'TONE', control3TypeId: pot('250k audio'), control3Function: 'NORMAL',
        description: 'Master volume, neck tone, middle tone, 5-way blade.',
      },
      {
        name: 'Telecaster 4-way', manufacturerId: maker('Fender'), wiringType: 'GUITAR_WIRING', pickupCount: 2,
        neckTypeId: pickupType('Single Coil'), bridgeTypeId: pickupType('Single Coil'), phaseReversible: false, splitCoil: false, connection: 'PARALLEL',
        controlCount: 2, control1Role: 'VOLUME', control1TypeId: pot('250k audio'), control1Function: 'NORMAL', control2Role: 'TONE', control2TypeId: pot('250k audio'), control2Function: 'NORMAL',
        description: 'Adds a series position to the standard Tele wiring.',
      },
      {
        name: 'HH coil split push-pull', wiringType: 'GUITAR_WIRING', pickupCount: 2,
        neckTypeId: pickupType('Humbucker'), bridgeTypeId: pickupType('Humbucker'),
        phaseReversible: false, splitCoil: true, connection: 'SERIAL',
        controlCount: 4, control1Role: 'VOLUME', control1TypeId: pot('500k audio'), control1Function: 'NORMAL', control2Role: 'VOLUME', control2TypeId: pot('500k push-pull'), control2Function: 'PUSH_PULL', control3Role: 'TONE', control3TypeId: pot('500k push-pull'), control3Function: 'PUSH_PULL', control4Role: 'TONE', control4TypeId: pot('500k push-pull'), control4Function: 'PUSH_PULL',
        description: 'Push-pull pots split the humbuckers to their slug coils.',
      },
      {
        name: 'Precision Bass', manufacturerId: maker('Fender'), wiringType: 'BASS_WIRING', pickupCount: 1,
        middleTypeId: pickupType('P-Bass'), phaseReversible: false, splitCoil: false, connection: 'SERIAL',
        controlCount: 2, control1Role: 'VOLUME', control1TypeId: pot('250k audio'), control1Function: 'NORMAL', control2Role: 'TONE', control2TypeId: pot('250k audio'), control2Function: 'NORMAL',
        description: 'Volume and tone only.',
      },
      {
        name: 'Telecaster 3-way', manufacturerId: maker('Fender'), wiringType: 'GUITAR_WIRING', pickupCount: 2,
        neckTypeId: pickupType('Single Coil'), bridgeTypeId: pickupType('Single Coil'), phaseReversible: false,
        splitCoil: false, connection: 'PARALLEL',
        ...controls([['VOLUME', '250k audio', 'NORMAL'], ['TONE', '250k audio', 'NORMAL']]),
        description: 'Classic 3-way blade with one volume and one tone.',
      },
      {
        name: 'Jazz Bass V-V-T', manufacturerId: maker('Fender'), wiringType: 'BASS_WIRING', pickupCount: 2,
        neckTypeId: pickupType('Jazz Bass'), bridgeTypeId: pickupType('Jazz Bass'), phaseReversible: false,
        splitCoil: false, connection: 'PARALLEL',
        ...controls([['VOLUME', '250k audio', 'NORMAL'], ['VOLUME', '250k audio', 'NORMAL'], ['TONE', '250k audio', 'NORMAL']]),
        description: 'One volume per pickup and a master tone.',
      },
      {
        name: 'Active HH with TBX', manufacturerId: maker('EMG'), wiringType: 'GUITAR_WIRING', pickupCount: 2,
        neckTypeId: pickupType('Humbucker'), bridgeTypeId: pickupType('Humbucker'), phaseReversible: false,
        splitCoil: false, connection: 'SERIAL',
        ...controls([['VOLUME', '25k active', 'NORMAL'], ['TONE', '25k active', 'TBX']]),
        description: 'Active pickups, 9 V battery, TBX tone control.',
      },
      {
        name: 'HSS Superstrat', manufacturerId: maker('Suhr'), wiringType: 'GUITAR_WIRING', pickupCount: 3,
        neckTypeId: pickupType('Single Coil'), middleTypeId: pickupType('Single Coil'), bridgeTypeId: pickupType('Humbucker'),
        phaseReversible: true, splitCoil: true, connection: 'PARALLEL',
        ...controls([['VOLUME', '500k audio', 'NORMAL'], ['TONE', '250k audio', 'NORMAL'], ['TONE', '500k push-pull', 'PUSH_PULL']]),
        description: '5-way blade; the push-pull tone splits the bridge humbucker.',
      },
      {
        name: 'Les Paul Junior P-90', manufacturerId: maker('Gibson'), wiringType: 'GUITAR_WIRING', pickupCount: 1,
        bridgeTypeId: pickupType('P90'), phaseReversible: false, splitCoil: false,
        ...controls([['VOLUME', '500k audio', 'NORMAL'], ['TONE', '500k audio', 'NORMAL']]),
        description: 'Single P-90, volume and tone.',
      },
      {
        name: 'Piezo + magnetic blend', wiringType: 'SPECIFIC', pickupCount: 2,
        neckTypeId: pickupType('Piezo'), bridgeTypeId: pickupType('Humbucker'), phaseReversible: true,
        splitCoil: false, connection: 'PARALLEL',
        ...controls([['VOLUME', '500k audio', 'NORMAL'], ['VOLUME', '500k audio', 'BLEND'], ['TONE', '250k audio', 'NORMAL']]),
        description: 'Blend pot between the magnetic and piezo pickup.',
      },
    ])
    .returning({ id: wiringDiagrams.id, name: wiringDiagrams.name })
    .all();
  const diagram = (name: string) => diagrams.find((d) => d.name === name)!.id;

  db.insert(wiringDiagramSwitches)
    .values([
      { diagramId: diagram('Les Paul standard'), switchTypeId: sw('Three Way Toggle'), position: 0 },
      { diagramId: diagram('Stratocaster SSS'), switchTypeId: sw('Five Way Blade'), position: 0 },
      { diagramId: diagram('Telecaster 4-way'), switchTypeId: sw('Four Way Blade'), position: 0 },
      { diagramId: diagram('HH coil split push-pull'), switchTypeId: sw('Three Way Toggle'), position: 0 },
      { diagramId: diagram('Telecaster 3-way'), switchTypeId: sw('Three Way Blade', 'Schaller'), position: 0 },
      { diagramId: diagram('Active HH with TBX'), switchTypeId: sw('Three Way Toggle', 'Gibson'), position: 0 },
      { diagramId: diagram('HSS Superstrat'), switchTypeId: sw('Five Way Blade', 'Fender'), position: 0 },
      { diagramId: diagram('Les Paul Junior P-90'), switchTypeId: sw('Three Way Toggle', 'Gibson'), position: 0 },
      { diagramId: diagram('Piezo + magnetic blend'), switchTypeId: sw('DPDT On On On'), position: 0 },
      { diagramId: diagram('Piezo + magnetic blend'), switchTypeId: sw('Four Way Blade', 'Fender'), position: 1 },
    ])
    .run();


  return `Seeded ${makers.length} manufacturers, ${pickupRows.length} pickups, 10 sets, ${pots.length} pot types, ${sws.length} switch types, ${pickupTypes.length} pickup types, ${diagrams.length} wiring diagrams, ${EXTRA_POT_LAYOUTS.length + DEFAULT_POT_LAYOUTS.length} pot layouts.`;
}
