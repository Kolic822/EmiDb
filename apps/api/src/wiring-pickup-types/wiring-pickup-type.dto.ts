import { InstrumentFamily, type WiringPickupTypeInput } from '@emidb/shared';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trimmed } from '../common/dto.js';

export class WiringPickupTypeDto implements WiringPickupTypeInput {
  @Trimmed() @IsString() @IsNotEmpty() @MaxLength(200)
  name: string;

  @IsOptional() @IsIn(InstrumentFamily.values)
  instrument: InstrumentFamily | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(2000)
  description: string | null = null;
}
