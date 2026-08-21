import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CompletedLapPositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  z: number;
}

export class CompletedLapSampleDto {
  @IsNumber()
  @Min(0)
  distanceM: number;

  @IsInt()
  @Min(0)
  elapsedMs: number;

  @IsNumber()
  @Min(0)
  speedKmh: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  throttle: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  brake: number;

  @IsNumber()
  @Min(-1)
  @Max(1)
  steer: number;

  @IsInt()
  @Min(-1)
  @Max(8)
  gear: number;

  @IsInt()
  @Min(0)
  engineRpm: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompletedLapPositionDto)
  position?: CompletedLapPositionDto;

  @IsOptional()
  @IsNumber()
  @Min(-Math.PI)
  @Max(Math.PI)
  yawRad?: number;
}

export class CompletedLapDto {
  @IsIn([1])
  schemaVersion: 1;

  @IsString()
  sourceLapId: string;

  @IsString()
  sourceSessionUid: string;

  @IsInt()
  @Min(0)
  circuitId: number;

  @IsIn([1, 2, 3, 4, 18])
  sessionType: number;

  @IsInt()
  @Min(1)
  trackLengthM: number;

  @IsInt()
  @Min(0)
  @Max(21)
  playerCarIndex: number;

  @IsInt()
  @Min(1)
  lapNumber: number;

  @IsInt()
  @Min(1)
  lapTimeMs: number;

  @IsBoolean()
  valid: boolean;

  @IsDateString()
  capturedAt: string;

  @ArrayMinSize(2)
  @ArrayMaxSize(5000)
  @ValidateNested({ each: true })
  @Type(() => CompletedLapSampleDto)
  samples: CompletedLapSampleDto[];
}
