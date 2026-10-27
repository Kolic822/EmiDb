import type { PickupSetInput } from '@emidb/shared';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Trimmed } from '../common/dto.js';

export class PickupSetDto implements PickupSetInput {
  @Trimmed() @IsString() @IsNotEmpty() @MaxLength(200)
  name: string;

  @IsOptional() @IsInt() @Min(1)
  manufacturerId: number | null = null;

  @IsOptional() @IsInt() @Min(1)
  neckId: number | null = null;

  @IsOptional() @IsInt() @Min(1)
  middleId: number | null = null;

  @IsOptional() @IsInt() @Min(1)
  bridgeId: number | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(10000)
  description: string | null = null;
}
