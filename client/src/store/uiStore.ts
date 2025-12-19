import { create } from "zustand";

type UIState = {
  isOpen: boolean;
  openSignUpDialog: () => void;
  closeSignUpDialog: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isOpen: false,
  openSignUpDialog: () => set({ isOpen: true }),
  closeSignUpDialog: () => set({ isOpen: false }),
}));
