import { type WiringDiagramInput, WiringPickupType, WiringType } from '@emidb/shared';
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

  @IsArray() @ArrayMaxSize(6) @IsIdArray()
  volumePots: number[] = [];

  @IsArray() @ArrayMaxSize(6) @IsIdArray()
  tonePots: number[] = [];

  @IsArray() @ArrayMaxSize(8) @IsIdArray()
  switches: number[] = [];

  @IsOptional() @IsBoolean()
  phaseReversible: boolean | null = null;

  @IsOptional() @IsBoolean()
  splitCoil: boolean | null = null;

  @IsOptional() @IsBoolean()
  serial: boolean | null = null;

  @IsOptional() @IsBoolean()
  parallel: boolean | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(10000)
  description: string | null = null;
}
