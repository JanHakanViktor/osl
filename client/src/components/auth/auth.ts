export type Team = {
  id: string;
  name: string;
  logo: string;
};

export type SignUpFormValues = {
  username: string;
  password: string;
  country: string;
  teamId: string | null;
};
