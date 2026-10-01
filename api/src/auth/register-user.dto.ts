import { Transform } from 'class-transformer';
import {
  IsIn,
  IsISO31661Alpha2,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LoginDto } from 'src/auth/signIn.dto';
import { TEAM_IDS, type TeamId } from 'src/data/team';

/**
 * Sign-up uses the same credential rules as login. The profile fields are
 * optional so older clients keep working; null means "not chosen".
 */
export class RegisterUserDto extends LoginDto {
  @IsOptional()
  @IsString()
  @MaxLength(24)
  drivername?: string;

  /** ISO 3166-1 alpha-2 code, stored upper-case (e.g. "SE"). */
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : (value ?? undefined),
  )
  @IsOptional()
  @IsISO31661Alpha2()
  country?: string;

  @Transform(({ value }: { value: unknown }) => value ?? undefined)
  @IsOptional()
  @IsIn(TEAM_IDS)
  teamId?: TeamId;
}
