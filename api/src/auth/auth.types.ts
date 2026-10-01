export interface SessionUser {
  id: string;
  username: string;
  drivername: string;
  isAdmin: boolean;
  /** ISO 3166-1 alpha-2 code, or null when the driver has not chosen one. */
  country: string | null;
  /** Team id from src/data/team.ts, or null when the driver has not chosen one. */
  teamId: string | null;
}
