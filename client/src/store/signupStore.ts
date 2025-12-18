import { create } from "zustand";

type SignUpState = {
  username: string;
  password: string;
  country: string;
  teamId: string | null;

  setField: <K extends keyof SignUpState>(
    key: K,
    value: SignUpState[K]
  ) => void;

  reset: () => void;
};

export const useSignUpStore = create<SignUpState>((set) => ({
  username: "",
  password: "",
  country: "",
  teamId: null,

  setField: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),

  reset: () => ({
    username: "",
    password: "",
    country: "",
    teamId: null,
  }),
}));
