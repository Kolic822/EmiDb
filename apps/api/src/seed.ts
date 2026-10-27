/**
 * Seeds the database with a realistic starter set so the UI has something to show.
 * Safe to run repeatedly: it only seeds an empty database.
 *
 *   npm run build -w api && npm run seed -w api
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { closeDatabase, openDatabase } from './database/database.js';
import {
  manufacturers,
  pickupSets,
  pickups,
  potentiometerTypes,
  switchTypes,
  wiringDiagrams,
  wiringDiagramSwitches,
} from './database/schema.js';

mkdirSync(path.dirname(config.databaseFile), { recursive: true });
const db = openDatabase(config.databaseFile);

if (db.select({ id: manufacturers.id }).from(manufacturers).limit(1).get()) {
  console.log('Database already has data, nothing to do.');
  closeDatabase();
  process.exit(0);
}

const makers = db
  .insert(manufacturers)
  .values([
    { name: 'Seymour Duncan', country: 'USA', website: 'https://www.seymourduncan.com' },
    { name: 'DiMarzio', country: 'USA', website: 'https://www.dimarzio.com' },
    { name: 'Gibson', country: 'USA', website: 'https://www.gibson.com' },
    { name: 'Fender', country: 'USA', website: 'https://www.fender.com' },
    { name: 'Bare Knuckle', country: 'UK', website: 'https://www.bareknucklepickups.co.uk' },
    { name: 'EMG', country: 'USA', website: 'https://www.emgpickups.com' },
    { name: 'Lollar', country: 'USA', website: 'https://www.lollarguitars.com' },
  ])
  .returning({ id: manufacturers.id, name: manufacturers.name })
  .all();
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
  ])
  .run();

const pots = db
  .insert(potentiometerTypes)
  .values([
    { name: '250k audio', description: 'Logarithmic taper, typical for single coils' },
    { name: '500k audio', description: 'Logarithmic taper, typical for humbuckers' },
    { name: '500k linear' },
    { name: '1M audio' },
    { name: '500k push-pull', description: 'DPDT switch on the pot shaft' },
    { name: '25k active', description: 'For active pickups' },
  ])
  .returning({ id: potentiometerTypes.id, name: potentiometerTypes.name })
  .all();
const pot = (name: string) => pots.find((p) => p.name === name)!.id;

const sws = db
  .insert(switchTypes)
  .values(
    [
      'S One',
      'Three Way Blade',
      'Three Way Super Switch',
      'Three Way Blade Schaller',
      'Three Way Toggle',
      'Three Way Two Pole Slide',
      'Four Way Blade',
      'Four Way Blade Super Switch',
      'Four Pdt On On On',
      'Five Way Blade',
      'Five Way Blade Super Switch',
      'Five Way Blade Schaller',
      'Five Way Rotary',
      'Two Pole Five Way Rotary',
      'DPDT On On',
      'DPDT On Off On',
      'DPDT On On On',
      'SPDT On On',
      'SPDT On Off On',
      'SPDT On On On',
    ].map((name) => ({ name })),
  )
  .returning({ id: switchTypes.id, name: switchTypes.name })
  .all();
const sw = (name: string) => sws.find((s) => s.name === name)!.id;

const diagrams = db
  .insert(wiringDiagrams)
  .values([
    {
      name: 'Les Paul standard', manufacturerId: maker('Gibson'), wiringType: 'GUITAR_WIRING', pickupCount: 2,
      neck: 'HUMBUCKER', bridge: 'HUMBUCKER', phaseReversible: false, splitCoil: false, serial: false, parallel: false,
      volumePotCount: 2, volumePot1TypeId: pot('500k audio'), volumePot1Function: 'NORMAL',
      volumePot2TypeId: pot('500k audio'), volumePot2Function: 'NORMAL',
      tonePotCount: 2, tonePot1TypeId: pot('500k audio'), tonePot1Function: 'NORMAL',
      tonePot2TypeId: pot('500k audio'), tonePot2Function: 'NORMAL',
      description: 'Two volumes, two tones, 3-way toggle. Modern wiring (tone after volume).',
    },
    {
      name: 'Stratocaster SSS', manufacturerId: maker('Fender'), wiringType: 'GUITAR_WIRING', pickupCount: 3,
      neck: 'SINGLE_COIL', middle: 'SINGLE_COIL', bridge: 'SINGLE_COIL', phaseReversible: false, splitCoil: false,
      serial: false, parallel: true,
      volumePotCount: 1, volumePot1TypeId: pot('250k audio'), volumePot1Function: 'NORMAL',
      tonePotCount: 2, tonePot1TypeId: pot('250k audio'), tonePot1Function: 'NORMAL',
      tonePot2TypeId: pot('250k audio'), tonePot2Function: 'NORMAL',
      description: 'Master volume, neck tone, middle tone, 5-way blade.',
    },
    {
      name: 'Telecaster 4-way', manufacturerId: maker('Fender'), wiringType: 'GUITAR_WIRING', pickupCount: 2,
      neck: 'SINGLE_COIL', bridge: 'SINGLE_COIL', phaseReversible: false, splitCoil: false, serial: true, parallel: true,
      volumePotCount: 1, volumePot1TypeId: pot('250k audio'), volumePot1Function: 'NORMAL',
      tonePotCount: 1, tonePot1TypeId: pot('250k audio'), tonePot1Function: 'NORMAL',
      description: 'Adds a series position to the standard Tele wiring.',
    },
    {
      name: 'HH coil split push-pull', wiringType: 'GUITAR_WIRING', pickupCount: 2, neck: 'HUMBUCKER', bridge: 'HUMBUCKER',
      phaseReversible: false, splitCoil: true, serial: true, parallel: false,
      volumePotCount: 2, volumePot1TypeId: pot('500k audio'), volumePot1Function: 'NORMAL',
      volumePot2TypeId: pot('500k push-pull'), volumePot2Function: 'PUSH_PULL',
      tonePotCount: 2, tonePot1TypeId: pot('500k push-pull'), tonePot1Function: 'PUSH_PULL',
      tonePot2TypeId: pot('500k push-pull'), tonePot2Function: 'PUSH_PULL',
      description: 'Push-pull pots split the humbuckers to their slug coils.',
    },
    {
      name: 'Precision Bass', manufacturerId: maker('Fender'), wiringType: 'BASS_WIRING', pickupCount: 1,
      middle: 'HUMBUCKER', phaseReversible: false, splitCoil: false, serial: true, parallel: false,
      volumePotCount: 1, volumePot1TypeId: pot('250k audio'), volumePot1Function: 'NORMAL',
      tonePotCount: 1, tonePot1TypeId: pot('250k audio'), tonePot1Function: 'NORMAL',
      description: 'Volume and tone only.',
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
  ])
  .run();

console.log(
  `Seeded ${makers.length} manufacturers, ${pickupRows.length} pickups, 3 sets, ${pots.length} pot types, ${sws.length} switch types, ${diagrams.length} wiring diagrams.`,
);
closeDatabase();
