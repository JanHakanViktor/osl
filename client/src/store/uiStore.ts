import { create } from "zustand";

type UIState = {
  SignUpDialogOpen: boolean;
  openSignUpDialog: () => void;
  closeSignUpDialog: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  SignUpDialogOpen: false,
  openSignUpDialog: () => set({ SignUpDialogOpen: true }),
  closeSignUpDialog: () => set({ SignUpDialogOpen: false }),
}));
