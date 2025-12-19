export interface UserCredentials {
  username: string;
  password: string;
}

export interface SessionUser {
  id: string;
  username: string;
  isAdmin: boolean;
}
