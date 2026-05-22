"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/api/userService";
import { ownerService } from "@/api/ownerService";
import { Search } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { Input } from "@/components/common/input";
import { useAuth } from "@/hooks/use-auth";
import { NetworkBanner } from "@/components/layout/network-banner";
import { NotificationCenter } from "@/components/layout/notification-center";
import { useThemeStore } from "@/store/theme-store";
import Link from "next/link";
import { formatImageUrl } from "@/utils/constants";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const theme = useThemeStore((state) => state.theme);
  const [mounted, setMounted] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: userService.me,
    enabled: !!session && mounted
  });

  const isStaff = session?.role === "OWNER" || session?.role === "BARBER";

  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ["my-shop-details"],
    queryFn: ownerService.getShopDetails,
    enabled: !!session && mounted && isStaff
  });

  // Handle both camelCase and snake_case for robust property access
  const firstName = user?.firstName || (user as any)?.first_name;
  const lastName = user?.lastName || (user as any)?.last_name;
  const username = user?.username;

  const workspaceName = !mounted || userLoading
    ? "Loading Workspace..."
    : firstName
      ? `${firstName}${lastName ? ` ${lastName}` : ""}'s Workspace${(isStaff && shop?.name) ? ` | ${shop.name}` : ""}`
      : username
        ? `${username}'s Workspace`
        : `${session?.role?.toLowerCase() ?? "Guest"} Workspace`;

  const profileLink = (session?.role === "BARBER" || session?.role === "OWNER" || session?.role === "ADMIN")
    ? "/barber/settings"
    : "/app/profile";

  return (
    <div className={`min-h-screen w-full flex items-start justify-center transition-colors duration-500 ${
      theme === "dark" ? "text-white" : "text-stone-900"
    }`}>
      <NetworkBanner />

      {/* ── Desktop: constrained floating layout widened for premium spacing ── */}
      <div className="hidden md:flex w-full max-w-[1600px] h-[90vh] gap-6 items-center p-8 lg:p-12">
        <Sidebar />

        <main className={`flex-1 h-full border rounded-[2.5rem] overflow-hidden flex flex-col relative transition-all duration-500 ${
          theme === "dark"
            ? "bg-white/5 backdrop-blur-3xl border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
            : "bg-white/85 border-stone-200 shadow-[0_32px_80px_rgba(40,30,20,0.06)]"
        }`}>
          <div className={`absolute inset-0 pointer-events-none rounded-[2.5rem] ${
            theme === "dark" ? "bg-gradient-to-br from-white/[0.08] to-transparent" : "bg-gradient-to-br from-stone-100/50 to-transparent"
          }`} />

          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col custom-scrollbar relative z-10">
            {/* Desktop Header */}
            <div className={`mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b pb-6 transition-colors ${
              theme === "dark" ? "border-white/10" : "border-stone-200"
            }`}>
              <div>
                <p className={`text-sm transition-colors ${theme === "dark" ? "text-white/50" : "text-stone-500"}`}>Welcome back,</p>
                <h1 className={`text-2xl font-black tracking-tight capitalize transition-colors ${theme === "dark" ? "text-white/90" : "text-stone-800"}`}>
                  {workspaceName}
                </h1>
              </div>
              <div className="flex flex-1 items-center gap-3 lg:max-w-xl">
                <div className="relative flex-1">
                  <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                    theme === "dark" ? "text-white/40" : "text-stone-400"
                  }`} />
                  <Input
                    className={`pl-11 rounded-full h-10 transition-colors ${
                      theme === "dark"
                        ? "bg-black/40 border-white/10 text-white placeholder:text-white/30"
                        : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                    }`}
                    placeholder="Search shops, barbers, bookings..."
                  />
                </div>
                <div className="group relative">
                  <ThemeToggle />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
                    Theme
                  </div>
                </div>
                <div className="group relative">
                  <LanguageSwitcher />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
                    Language
                  </div>
                </div>
                <NotificationCenter />

                <Link href={profileLink} className="group relative shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center hover:border-orange-500 active:scale-95 transition-all">
                    {user?.avatarUrl ? (
                      <img src={formatImageUrl(user.avatarUrl)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-orange-400">
                        {firstName?.[0] || username?.[0] || "U"}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
                    Profile Settings
                  </div>
                </Link>
              </div>
            </div>

            {/* Desktop Content */}
            <div className="flex-1 flex flex-col">{children}</div>
          </div>
        </main>
      </div>

      {/* ── Mobile: full-screen scrollable layout ── */}
      <div className="md:hidden flex flex-col w-full min-h-screen">
        {/* Mobile Header */}
        <header className={`sticky top-0 z-40 backdrop-blur-2xl border-b px-4 py-3 flex items-center gap-3 transition-colors ${
          theme === "dark"
            ? "bg-[#0c090a]/80 border-white/10 text-white"
            : "bg-white/90 border-stone-200 text-stone-900"
        }`}>
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] uppercase tracking-widest transition-colors ${theme === "dark" ? "text-white/40" : "text-stone-500"}`}>Welcome back</p>
            <h1 className={`text-sm font-black capitalize truncate transition-colors ${theme === "dark" ? "text-white/90" : "text-stone-800"}`}>
              {workspaceName}
            </h1>
          </div>

          {/* Mobile action icons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSearchOpen(v => !v)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl border active:scale-90 transition-all ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-white/60"
                  : "bg-stone-100 border-stone-200 text-stone-600"
              }`}
            >
              <Search size={16} />
            </button>
            <ThemeToggle />
            <LanguageSwitcher />
            <NotificationCenter />

            <Link href={profileLink} className="shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center active:scale-90 transition-all">
                {user?.avatarUrl ? (
                  <img src={formatImageUrl(user.avatarUrl)} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-orange-400">
                    {firstName?.[0] || username?.[0] || "U"}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Mobile Search Dropdown */}
        {searchOpen && (
          <div className={`px-4 py-3 border-b backdrop-blur-2xl transition-colors ${
            theme === "dark" ? "bg-black/50 border-white/10" : "bg-white/95 border-stone-200"
          }`}>
            <div className="relative">
              <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
                theme === "dark" ? "text-white/40" : "text-stone-400"
              }`} />
              <Input
                autoFocus
                className={`pl-11 rounded-full h-10 w-full transition-colors ${
                  theme === "dark"
                    ? "bg-black/40 border-white/10 text-white placeholder:text-white/30"
                    : "bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400"
                }`}
                placeholder="Search shops, barbers, bookings..."
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Mobile Content — pb-20 clears the bottom nav */}
        <main className="flex-1 flex flex-col p-4 pb-24">
          {children}
        </main>

        {/* Mobile bottom nav is rendered by <Sidebar /> */}
        <Sidebar />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.18)"};
        }
      `}} />
    </div>
  );
}
