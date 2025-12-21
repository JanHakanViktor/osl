import { create } from "zustand";

export type AuthMode = "sign-in" | "sign-up";

type UIState = {
  isOpen: boolean;
  authMode: AuthMode;

  openSignUpDialog: () => void;
  openSignInDialog: () => void;
  closeAuth: () => void;
  switchToSignIn: () => void;
  switchToSignUp: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isOpen: false,
  authMode: "sign-in",
  closeAuth: () => set({ isOpen: false }),
  openSignUpDialog: () => set({ isOpen: true, authMode: "sign-up" }),
  openSignInDialog: () => set({ isOpen: true, authMode: "sign-in" }),
  switchToSignIn: () => set({ authMode: "sign-in" }),
  switchToSignUp: () => set({ authMode: "sign-up" }),
}));
