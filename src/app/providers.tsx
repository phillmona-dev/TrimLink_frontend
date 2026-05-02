"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useThemeStore } from "@/store/theme-store";
import "@/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            staleTime: 30_000,
            refetchOnWindowFocus: false
          },
          mutations: {
            retry: 1
          }
        }
      })
  );
  const theme = useThemeStore((state) => state.theme);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);

  React.useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
