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
  type PickupInput,
  PottingType,
  StringInstrument,
  WindingDirection,
  WindingMethod,
} from '@emidb/shared';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Trimmed } from '../common/dto.js';

export class PickupDto implements PickupInput {
  // Identity
  @Trimmed() @IsString() @IsNotEmpty() @MaxLength(200)
  name: string;

  @IsOptional() @IsInt() @Min(1)
  manufacturerId: number | null = null;

  @IsOptional() @IsInt() @Min(1900) @Max(2100)
  year: number | null = null;

  @IsOptional() @IsIn(PickupType.values)
  type: PickupType | null = null;

  @IsOptional() @IsIn(PickupPosition.values)
  position: PickupPosition | null = null;

  @IsOptional() @IsIn(PickupActivity.values)
  activity: PickupActivity | null = null;

  @IsOptional() @IsIn(StringInstrument.values)
  instrument: StringInstrument | null = null;

  @IsOptional() @IsInt() @Min(1) @Max(12)
  stringCount: number | null = null;

  // Electrical
  @IsOptional() @IsNumber() @Min(0)
  resistance: number | null = null;

  @IsOptional() @IsNumber() @Min(0)
  coilTapAt: number | null = null;

  @IsOptional() @IsNumber() @Min(0)
  inductance: number | null = null;

  @IsOptional() @IsNumber() @Min(0)
  gauss: number | null = null;

  @IsOptional() @IsNumber() @Min(0)
  tesla: number | null = null;

  @IsOptional() @IsIn(PickupOutput.values)
  output: PickupOutput | null = null;

  @IsOptional() @IsNumber() @Min(0)
  outputMv: number | null = null;

  @IsOptional() @IsBoolean()
  balanced: boolean | null = null;

  // Magnet & coil
  @IsOptional() @IsIn(MagneticDirection.values)
  magneticDirection: MagneticDirection | null = null;

  @IsOptional() @IsInt() @Min(0)
  magnetCount: number | null = null;

  @IsOptional() @IsInt() @Min(0)
  firstCoilWinds: number | null = null;

  @IsOptional() @IsInt() @Min(0)
  secondCoilWinds: number | null = null;

  @IsOptional() @IsIn(WindingDirection.values)
  windingDirection: WindingDirection | null = null;

  @IsOptional() @IsIn(WindingMethod.values)
  windingMethod: WindingMethod | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(200)
  magnetType: string | null = null;

  @IsOptional() @IsBoolean()
  potted: boolean | null = null;

  @IsOptional() @IsIn(PottingType.values)
  pottingType: PottingType | null = null;

  // Wiring
  @Trimmed() @IsOptional() @IsString() @MaxLength(200)
  wireType: string | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(200)
  insulationType: string | null = null;

  @IsOptional() @IsIn(InsulationColor.values)
  insulationColor: InsulationColor | null = null;

  @IsOptional() @IsIn(ConnectionType.values)
  connectionType: ConnectionType | null = null;

  @IsOptional() @IsBoolean()
  separable: boolean | null = null;

  @IsOptional() @IsInt() @Min(1) @Max(6)
  outputWireCount: number | null = null;

  @IsOptional() @IsBoolean()
  adjustableCore: boolean | null = null;

  // Construction & source
  @IsOptional() @IsIn(CarrierType.values)
  carrierType: CarrierType | null = null;

  @IsOptional() @IsIn(CapMaterial.values)
  capMaterial: CapMaterial | null = null;

  @IsOptional() @IsIn(InformationSource.values)
  informationSource: InformationSource | null = null;

  @IsOptional() @IsInt() @Min(1) @Max(10)
  sourceMark: number | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(1000)
  webLink: string | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(1000)
  autocadLink: string | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(10000)
  description: string | null = null;
}
