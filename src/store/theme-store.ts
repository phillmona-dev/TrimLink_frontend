import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  initialized: boolean;
  initializeTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  initialized: false,
  initializeTheme: () => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem("trimlink.theme");
    const nextTheme: Theme =
      storedTheme === "dark" || storedTheme === "light"
        ? storedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    set({
      theme: nextTheme,
      initialized: true
    });
  },
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("trimlink.theme", theme);
    }
    set({
      theme,
      initialized: true
    });
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        window.localStorage.setItem("trimlink.theme", next);
      }
      return {
        theme: next,
        initialized: true
      };
    })
}));
