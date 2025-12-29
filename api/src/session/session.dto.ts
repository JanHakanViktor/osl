import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  sessionName: string;

  @IsNumber()
  circuitId: number;

  @IsString()
  circuitName: string;

  @IsEnum(['TIME', 'LAPS'])
  limitType: 'TIME' | 'LAPS';

  @IsOptional()
  @IsNumber()
  timeLimitSeconds?: number;

  @IsOptional()
  @IsNumber()
  lapLimit?: number;
}
