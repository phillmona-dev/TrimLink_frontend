"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { dashboardRoleMap } from "@/utils/constants";

export function ProtectedRoute({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !session) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      router.replace(dashboardRoleMap[session.role]);
    }
  }, [mounted, allowedRoles, isAuthenticated, pathname, router, session]);

  // Show nothing (not a redirect) until mounted — prevents flash of wrong content
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !session) return null;
  if (allowedRoles && !allowedRoles.includes(session.role)) return null;

  return children;
}
