import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum SessionLimitType {
  TIME = 'TIME',
  LAPS = 'LAPS',
}
export class CreateSessionDto {
  @IsString()
  sessionName: string;

  @IsNumber()
  circuitId: number;

  @IsEnum(SessionLimitType)
  limitType: SessionLimitType;

  @IsOptional()
  @IsNumber()
  timeLimitSeconds?: number;

  @IsOptional()
  @IsNumber()
  lapLimit?: number;
}
