import type { ComponentTypeInput, SwitchTypeInput } from '@emidb/shared';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Trimmed } from '../common/dto.js';

export class ComponentTypeDto implements ComponentTypeInput {
  @Trimmed() @IsString() @IsNotEmpty() @MaxLength(200)
  name: string;

  @Trimmed() @IsOptional() @IsString() @MaxLength(2000)
  description: string | null = null;
}

export class SwitchTypeDto extends ComponentTypeDto implements SwitchTypeInput {
  @IsOptional() @IsInt() @Min(1)
  manufacturerId: number | null = null;
}
