"use client";

import { Moon, SunMedium } from "lucide-react";
import { Button } from "@/components/common/button";
import { useThemeStore } from "@/store/theme-store";

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const initialized = useThemeStore((state) => state.initialized);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {initialized ? (
        theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />
      ) : (
        <span className="h-4 w-4" />
      )}
    </Button>
  );
}
