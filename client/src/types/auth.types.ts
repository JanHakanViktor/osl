export type AuthUser = {
  id: string;
  username: string;
  drivername: string;
  isAdmin: boolean;
  /** ISO 3166-1 alpha-2 code from COUNTRIES, or null when not chosen. */
  country: string | null;
  /** Team id from TEAMS, or null when not chosen. */
  teamId: string | null;
};

export type LoginFormValues = {
  username: string;
  password: string;
};

export type SignUpFormValues = {
  username: string;
  password: string;
  drivername: string;
  country: string;
  teamId: string | null;
};
