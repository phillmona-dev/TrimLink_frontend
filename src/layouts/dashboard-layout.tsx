"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/api/userService";
import { LogOut, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { useAuth } from "@/hooks/use-auth";
import { NetworkBanner } from "@/components/layout/network-banner";
import { AnimatedIcon } from "@/components/common/animated-icon";
import { NotificationCenter } from "@/components/layout/notification-center";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, logout } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: userService.me,
    enabled: !!session && mounted
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 lg:p-12 text-white">
      <NetworkBanner />
      
      <div className="flex w-full max-w-7xl h-[90vh] gap-6 items-center">
        
        {/* Detached Sidebar */}
        <Sidebar />

        {/* Main Glass Container */}
        <main className="flex-1 h-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden flex flex-col relative">
          
          {/* Subtle inner glass highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none rounded-[2.5rem]"></div>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col custom-scrollbar relative z-10">
            
            {/* Dashboard Header */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-white/10 pb-6">
              <div>
                <p className="text-sm text-white/50">Welcome back,</p>
                <h1 className="text-2xl font-black tracking-tight text-white/90 capitalize">
                  {!mounted ? "Workspace" : (user?.firstName ? `${user.firstName}'s Workspace` : `${session?.role?.toLowerCase() ?? "Guest"} Workspace`)}
                </h1>
              </div>
              <div className="flex flex-1 items-center gap-3 lg:max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  <Input className="pl-11 bg-black/40 border-white/10 text-white placeholder:text-white/30 rounded-full h-10" placeholder="Search shops, staffs, bookings..." />
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

                <div className="group relative">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={logout}
                    className="rounded-full border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white shrink-0"
                  >
                    <AnimatedIcon icon={LogOut} size={16} animate="wiggle" />
                  </Button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
                    Logout
                  </div>
                </div>

                <NotificationCenter />
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 flex flex-col">
              {children}
            </div>

          </div>
        </main>
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
