export interface UserCredentials {
  username: string;
  password: string;
  drivername?: string;
}

export interface SessionUser {
  id: string;
  username: string;
  drivername: string;
  isAdmin: boolean;
}
