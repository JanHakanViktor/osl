export type AuthUser = {
  id: string;
  username: string;
  isAdmin: boolean;
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
