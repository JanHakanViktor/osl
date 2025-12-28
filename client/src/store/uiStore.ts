import { create } from "zustand";

export type AuthMode = "sign-in" | "sign-up";

type UIState = {
  isOpen: boolean;
  authMode: AuthMode;
  authMessage?: string;
  isDrawerOpen: boolean;

  openSignUpDialog: () => void;
  openSignInDialog: (message?: string) => void;
  closeAuth: () => void;
  switchToSignIn: () => void;
  switchToSignUp: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isOpen: false,
  isDrawerOpen: false,
  authMode: "sign-in",
  authMessage: undefined,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  closeAuth: () => set({ isOpen: false }),
  openSignUpDialog: () => set({ isOpen: true, authMode: "sign-up" }),
  openSignInDialog: (message) =>
    set({ isOpen: true, authMode: "sign-in", authMessage: message }),
  switchToSignIn: () => set({ authMode: "sign-in" }),
  switchToSignUp: () => set({ authMode: "sign-up" }),
}));
