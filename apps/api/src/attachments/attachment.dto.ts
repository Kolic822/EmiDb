import { AttachmentOwner, type AttachmentInput } from '@emidb/shared';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Trimmed } from '../common/dto.js';

/** Multipart form fields sent alongside the file. */
export class UploadAttachmentDto {
  @IsIn(AttachmentOwner.values)
  owner: AttachmentOwner;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  ownerId: number;

  @Trimmed() @IsOptional() @IsString() @MaxLength(500)
  caption: string | null = null;
}

export class UpdateAttachmentDto implements AttachmentInput {
  @Trimmed() @IsOptional() @IsString() @MaxLength(500)
  caption: string | null = null;
}

export class ListAttachmentsQuery {
  @IsIn(AttachmentOwner.values)
  owner: AttachmentOwner;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  ownerId: number;
}
