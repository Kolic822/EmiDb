import type { ManufacturerInput } from '@emidb/shared';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trimmed } from '../common/dto.js';

export class ManufacturerDto implements ManufacturerInput {
  @Trimmed() @IsString() @IsNotEmpty() @MaxLength(200)
  name: string;

  @Trimmed() @IsOptional() @IsString() @MaxLength(100)
  country: string | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(500)
  website: string | null = null;

  @Trimmed() @IsOptional() @IsString() @MaxLength(5000)
  notes: string | null = null;
}
