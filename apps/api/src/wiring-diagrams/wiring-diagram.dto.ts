import { ConnectionType, PotFunction, type WiringDiagramInput, WiringPickupType, WiringType } from '@emidb/shared';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsIdArray, Trimmed } from '../common/dto.js';

export class WiringDiagramDto implements WiringDiagramInput {
  @Trimmed() @IsString() @IsNotEmpty() @MaxLength(200)
  name: string;

  @IsOptional() @IsInt() @Min(1)
  manufacturerId: number | null = null;

  @IsOptional() @IsIn(WiringType.values)
  wiringType: WiringType | null = null;

  @IsOptional() @IsInt() @Min(1) @Max(3)
  pickupCount: number | null = null;

  @IsOptional() @IsIn(WiringPickupType.values)
  neck: WiringPickupType | null = null;

  @IsOptional() @IsIn(WiringPickupType.values)
  middle: WiringPickupType | null = null;

  @IsOptional() @IsIn(WiringPickupType.values)
  bridge: WiringPickupType | null = null;

  @IsOptional() @IsInt() @Min(0) @Max(3)
  volumePotCount: number | null = null;

  @IsOptional() @IsInt() @Min(1)
  volumePot1TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  volumePot1Function: PotFunction | null = null;

  @IsOptional() @IsInt() @Min(1)
  volumePot2TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  volumePot2Function: PotFunction | null = null;

  @IsOptional() @IsInt() @Min(1)
  volumePot3TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  volumePot3Function: PotFunction | null = null;

  @IsOptional() @IsInt() @Min(0) @Max(3)
  tonePotCount: number | null = null;

  @IsOptional() @IsInt() @Min(1)
  tonePot1TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  tonePot1Function: PotFunction | null = null;

  @IsOptional() @IsInt() @Min(1)
  tonePot2TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  tonePot2Function: PotFunction | null = null;

  @IsOptional() @IsInt() @Min(1)
  tonePot3TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  tonePot3Function: PotFunction | null = null;

  @IsArray() @ArrayMaxSize(8) @IsIdArray()
  switches: number[] = [];

  @IsOptional() @IsBoolean()
  phaseReversible: boolean | null = null;

  @IsOptional() @IsBoolean()
  splitCoil: boolean | null = null;

  @IsOptional() @IsIn(ConnectionType.values)
  connection: ConnectionType | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(10000)
  description: string | null = null;
}
