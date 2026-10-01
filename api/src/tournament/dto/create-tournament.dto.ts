import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { RULE_SET_IDS, type RuleSetId } from '../domain/rule-sets';
import {
  TOURNAMENT_WEATHER,
  type TournamentWeather,
} from '../domain/tournament.types';

export const MAX_TOURNAMENT_DRIVERS = 12;
export const MAX_LAPS_PER_DRIVER = 20;

export class CreateTournamentDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name: string;

  @IsIn(TOURNAMENT_WEATHER)
  weather: TournamentWeather;

  @IsInt()
  @Min(1)
  @Max(MAX_LAPS_PER_DRIVER)
  lapsPerDriver: number;

  @IsBoolean()
  cleanLapBonus: boolean;

  @IsBoolean()
  topSpeedBonus: boolean;

  @IsIn(RULE_SET_IDS)
  ruleSetId: RuleSetId;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(MAX_TOURNAMENT_DRIVERS)
  @ArrayUnique()
  @IsMongoId({ each: true })
  driverIds: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(24)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(0, { each: true })
  circuitIds: number[];
}
