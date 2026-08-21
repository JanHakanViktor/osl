import { IsMongoId } from 'class-validator';

export class SelectReferenceDto {
  @IsMongoId()
  referenceLapId: string;
}
