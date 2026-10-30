import { Matches } from 'class-validator';

export class TimingSessionParamsDto {
  /** The game's 64-bit session UID, in decimal. */
  @Matches(/^\d{1,20}$/, { message: 'sessionUid must be a game session id' })
  sessionUid: string;
}
