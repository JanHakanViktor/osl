import { IsDate, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SessionListItemDto {
  @IsString()
  id: string;

  @IsString()
  sessionName: string;

  @IsString()
  circuitName: string;

  @IsNumber()
  fastestLapMs: number;

  @IsDate()
  @Type(() => Date)
  finishedAt: Date;
}
