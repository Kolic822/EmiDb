import type { ComponentTypeInput } from '@emidb/shared';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Trimmed } from '../common/dto.js';

export class ComponentTypeDto implements ComponentTypeInput {
  @Trimmed() @IsString() @IsNotEmpty() @MaxLength(200)
  name: string;

  @Trimmed() @IsOptional() @IsString() @MaxLength(2000)
  description: string | null = null;
}
