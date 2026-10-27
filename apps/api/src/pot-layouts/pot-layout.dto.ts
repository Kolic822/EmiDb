import { ControlRole, type PotLayoutInput } from '@emidb/shared';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trimmed } from '../common/dto.js';

export class PotLayoutDto implements PotLayoutInput {
  @Trimmed() @IsString() @IsNotEmpty() @MaxLength(200)
  name: string;

  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(6) @IsIn(ControlRole.values, { each: true })
  roles: ControlRole[];

  @Trimmed() @IsOptional() @IsString() @MaxLength(2000)
  description: string | null = null;
}
