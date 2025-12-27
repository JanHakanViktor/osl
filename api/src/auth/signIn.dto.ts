import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(4)
  @MaxLength(24)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
