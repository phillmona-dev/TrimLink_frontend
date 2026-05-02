import { create } from "zustand";

type AppState = {
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen })
}));
