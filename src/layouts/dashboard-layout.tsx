"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/api/userService";
import { Search } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { Input } from "@/components/common/input";
import { useAuth } from "@/hooks/use-auth";
import { NetworkBanner } from "@/components/layout/network-banner";
import { NotificationCenter } from "@/components/layout/notification-center";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: userService.me,
    enabled: !!session && mounted
  });

  const workspaceName = !mounted
    ? "Workspace"
    : user?.firstName
      ? `${user.firstName}'s Workspace`
      : `${session?.role?.toLowerCase() ?? "Guest"} Workspace`;

  return (
    <div className="min-h-screen w-full flex items-start justify-center text-white">
      <NetworkBanner />

      {/* ── Desktop: constrained floating layout ── */}
      <div className="hidden md:flex w-full max-w-7xl h-[90vh] gap-6 items-center p-8 lg:p-12">
        <Sidebar />

        <main className="flex-1 h-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden flex flex-col relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none rounded-[2.5rem]" />

          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col custom-scrollbar relative z-10">
            {/* Desktop Header */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-6">
              <div>
                <p className="text-sm text-white/50">Welcome back,</p>
                <h1 className="text-2xl font-black tracking-tight text-white/90 capitalize">
                  {workspaceName}
                </h1>
              </div>
              <div className="flex flex-1 items-center gap-3 lg:max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input
                    className="pl-11 bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-full h-10"
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
        <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-2xl border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Welcome back</p>
            <h1 className="text-sm font-black text-white/90 capitalize truncate">
              {workspaceName}
            </h1>
          </div>

          {/* Mobile action icons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 active:scale-90 transition-all"
            >
              <Search size={16} />
            </button>
            <ThemeToggle />
            <LanguageSwitcher />
            <NotificationCenter />
          </div>
        </header>

        {/* Mobile Search Dropdown */}
        {searchOpen && (
          <div className="px-4 py-3 bg-black/50 backdrop-blur-2xl border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                autoFocus
                className="pl-11 bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-full h-10 w-full"
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}} />
    </div>
  );
}
