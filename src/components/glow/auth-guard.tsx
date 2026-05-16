"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlowAuthStore, GlowUserRole } from "@/lib/glow-auth-store";
import { Sparkles } from "lucide-react";

interface GlowAuthGuardProps {
  children: React.ReactNode;
  requireRole?: GlowUserRole | GlowUserRole[];
}

export default function GlowAuthGuard({ children, requireRole }: GlowAuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useGlowAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for hydration from localStorage
    const timeout = setTimeout(() => {
      const store = useGlowAuthStore.getState();

      if (!store.isAuthenticated) {
        router.replace("/glow/auth/login");
        return;
      }

      if (requireRole && store.user) {
        const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];
        if (!allowed.includes(store.user.role)) {
          // Wrong role → redirect to appropriate dashboard
          if (store.user.role === "OWNER") {
            router.replace("/glow/salon/dashboard");
          } else {
            router.replace("/glow/dashboard");
          }
          return;
        }
      }

      setChecked(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, user, requireRole, router]);

  if (!checked) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div className="h-1 w-24 rounded-full overflow-hidden" style={{ background: "rgba(200,149,108,0.15)" }}>
            <div className="h-full w-1/2 rounded-full animate-pulse" style={{ background: "linear-gradient(90deg,#C8956C,#E8B4A0)" }} />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
