"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { userService } from "@/api/userService";
import { setStoredItem } from "@/utils/storage";
import { ACCESS_KEY, REFRESH_KEY, USER_KEY, dashboardRoleMap } from "@/utils/constants";
import type { UserSession } from "@/types";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      // Temporarily store tokens to make the /me request
      // We set a partial USER_KEY so the axios interceptor picks up the token
      setStoredItem(ACCESS_KEY, accessToken);
      setStoredItem(REFRESH_KEY, refreshToken);
      setStoredItem(USER_KEY, { accessToken } as any);

      // Fetch user profile to complete the session
      userService.me()
        .then((user) => {
          if (!user) {
            throw new Error("User profile not found or access denied");
          }

          const session: UserSession = {
            userId: user.id,
            phone: user.phoneNumber || user.username || "",
            role: user.role as any,
            accessToken,
            refreshToken,
            accessTokenExpiresIn: 900000,
          };

          setSession(session);
          
          // Check for pending shop registration
          const isPendingShop = localStorage.getItem("pending_shop_registration") === "true";
          localStorage.removeItem("pending_shop_registration");

          if (isPendingShop && session.role === "CUSTOMER") {
            router.push("/auth/register/shop/complete");
            return;
          }

          // Redirect based on role
          const redirectPath = dashboardRoleMap[session.role] || "/app";
          router.push(redirectPath);
        })
        .catch((err) => {
          console.error("Failed to fetch user profile after OAuth2", err);
          router.push("/auth/login?error=oauth2_failed");
        });
    } else {
      router.push("/auth/login?error=missing_tokens");
    }
  }, [searchParams, router, setSession]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-medium">Completing sign in...</h2>
      <p className="text-white/50 mt-2 text-sm">Please wait while we sync your profile.</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-medium">Loading...</h2>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
