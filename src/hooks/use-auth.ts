import { useMemo } from "react";
import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);

  return useMemo(
    () => ({
      session,
      logout,
      isAuthenticated: Boolean(session),
      role: session?.role ?? null
    }),
    [logout, session]
  );
}
