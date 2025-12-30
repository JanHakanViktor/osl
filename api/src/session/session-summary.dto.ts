import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SessionOverviewDto {
  @IsString()
  sessionName: string;

  @IsString()
  circuitName: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startedAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  finishedAt?: Date;

  @ValidateNested()
  @Type(() => TelemetryOverviewDto)
  telemetry: TelemetryOverviewDto;
}

export class TelemetryOverviewDto {
  @IsNumber()
  fastestLapMs: number;

  @IsNumber()
  topSpeedKmh: number;

  @IsNumber()
  cleanLapStreak: number;

  @IsNumber()
  bestCleanLapStreak: number;

  @IsNumber()
  totalCleanLaps: number;
}
