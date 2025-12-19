import { create } from "zustand";

export type AuthUser = {
  id: string;
  username: string;
  isAdmin: boolean;
};

type AuthState = {
  user: AuthUser | null;
  signedIn: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  signedIn: false,
  setUser: (user) => set({ user, signedIn: true }),
  clearUser: () => set({ user: null, signedIn: false }),
}));
