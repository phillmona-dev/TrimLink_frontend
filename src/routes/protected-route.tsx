"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!isAuthenticated || !session) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      router.replace(dashboardRoleMap[session.role]);
    }
  }, [allowedRoles, isAuthenticated, pathname, router, session]);

  if (!isAuthenticated || !session) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return null;
  }

  return children;
}
