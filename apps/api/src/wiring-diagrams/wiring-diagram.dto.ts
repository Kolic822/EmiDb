import { ConnectionType, ControlRole, PotFunction, type WiringDiagramInput, WiringType } from '@emidb/shared';
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

  @IsOptional() @IsInt() @Min(1)
  neckTypeId: number | null = null;

  @IsOptional() @IsInt() @Min(1)
  middleTypeId: number | null = null;

  @IsOptional() @IsInt() @Min(1)
  bridgeTypeId: number | null = null;

  @IsOptional() @IsInt() @Min(0) @Max(6)
  controlCount: number | null = null;

  @IsOptional() @IsIn(ControlRole.values)
  control1Role: ControlRole | null = null;

  @IsOptional() @IsInt() @Min(1)
  control1TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  control1Function: PotFunction | null = null;

  @IsOptional() @IsIn(ControlRole.values)
  control2Role: ControlRole | null = null;

  @IsOptional() @IsInt() @Min(1)
  control2TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  control2Function: PotFunction | null = null;

  @IsOptional() @IsIn(ControlRole.values)
  control3Role: ControlRole | null = null;

  @IsOptional() @IsInt() @Min(1)
  control3TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  control3Function: PotFunction | null = null;

  @IsOptional() @IsIn(ControlRole.values)
  control4Role: ControlRole | null = null;

  @IsOptional() @IsInt() @Min(1)
  control4TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  control4Function: PotFunction | null = null;

  @IsOptional() @IsIn(ControlRole.values)
  control5Role: ControlRole | null = null;

  @IsOptional() @IsInt() @Min(1)
  control5TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  control5Function: PotFunction | null = null;

  @IsOptional() @IsIn(ControlRole.values)
  control6Role: ControlRole | null = null;

  @IsOptional() @IsInt() @Min(1)
  control6TypeId: number | null = null;

  @IsOptional() @IsIn(PotFunction.values)
  control6Function: PotFunction | null = null;

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
