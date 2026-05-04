"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, CalendarDays, Clock, Home, LayoutDashboard,
  LogOut, Scissors, Settings, Users, MessageCircle
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedIcon } from "@/components/common/animated-icon";

export function Sidebar() {
  const { role, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links =
    role === "BARBER"
      ? [
          { to: "/barber", label: "Dashboard", icon: LayoutDashboard },
          { to: "/barber/queue", label: "Queue", icon: Clock },
          { to: "/barber/services", label: "Services", icon: Scissors },
          { to: "/barber/reviews", label: "Reviews", icon: Bell },
          { to: "/barber/settings", label: "Settings", icon: Settings }
        ]
      : role === "OWNER"
        ? [
            { to: "/owner", label: "Overview", icon: LayoutDashboard },
            { to: "/owner/staff", label: "Staff", icon: Users },
            { to: "/owner/catalog", label: "Catalog", icon: Scissors },
            { to: "/owner/services", label: "Services", icon: Users },
            { to: "/barber/queue", label: "Queue", icon: Clock },
            { to: "/owner/bookings", label: "Bookings", icon: CalendarDays },
            { to: "/owner/settings", label: "Settings", icon: Settings }
          ]
        : role === "ADMIN"
          ? [
              { to: "/admin", label: "Overview", icon: LayoutDashboard },
              { to: "/admin/users", label: "Users", icon: Users },
              { to: "/admin/shops", label: "Shops", icon: Home },
              { to: "/admin/support", label: "Support", icon: MessageCircle },
              { to: "/admin/settings", label: "Settings", icon: Settings }
            ]
          : [
              { to: "/app", label: "Home", icon: Home },
              { to: "/app/appointments", label: "Appointments", icon: CalendarDays },
              { to: "/app/queue", label: "Queue", icon: Clock },
              { to: "/app/profile", label: "Profile", icon: Settings }
            ];

  // Skeleton during SSR
  if (!mounted) {
    return (
      <>
        {/* Desktop skeleton */}
        <aside className="relative z-50 hidden md:flex flex-col items-center gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-full py-8 px-4 w-16 shrink-0 h-fit min-h-[500px]" />
        {/* Mobile skeleton */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-black/60 backdrop-blur-2xl border-t border-white/10" />
      </>
    );
  }

  return (
    <>
      {/* ─── Desktop Vertical Sidebar (unchanged) ──────────────────────── */}
      <aside className="relative z-50 hidden md:flex flex-col items-center gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-full py-8 px-4 w-16 shrink-0 h-fit min-h-[500px]">
        <div className="flex flex-col items-center gap-6 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.to;

            return (
              <div key={link.to} className="group relative flex items-center">
                <Link
                  href={link.to}
                  className={`p-3 rounded-full transition ${
                    isActive
                      ? "bg-orange-500/20 border border-orange-500/30 text-orange-400 shadow-[0_0_15px_rgba(255,136,0,0.3)]"
                      : "text-white/50 hover:text-white/90"
                  }`}
                >
                  <AnimatedIcon icon={Icon} size={20} />
                </Link>

                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none shadow-2xl z-50">
                  {link.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-black/80" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="group relative flex items-center">
          <button
            onClick={logout}
            className="p-3 rounded-full text-white/50 hover:text-red-400 hover:bg-red-500/10 transition mt-auto"
          >
            <AnimatedIcon icon={LogOut} size={20} animate="wiggle" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none shadow-2xl z-50">
            Logout
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-black/80" />
          </div>
        </div>
      </aside>

      {/* ─── Mobile Bottom Navigation Bar ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-2xl border-t border-white/10 safe-area-inset-bottom">
        {/* We use overflow-x-auto to handle many links (like the 7 Owner links) without squishing them */}
        <div className="flex items-center gap-1 overflow-x-auto px-2 h-16 hide-scrollbar relative">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.to || pathname.startsWith(link.to + "/");

            return (
              <Link
                key={link.to}
                href={link.to}
                className={`flex shrink-0 flex-col items-center justify-center gap-1 w-[60px] h-full transition-all active:scale-90 ${
                  isActive
                    ? "text-orange-400"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-orange-500/20 shadow-[0_0_12px_rgba(255,136,0,0.3)]"
                    : ""
                }`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider leading-none text-center w-full truncate px-1 ${
                  isActive ? "text-orange-400" : "text-white/30"
                }`}>
                  {link.label}
                </span>
              </Link>
            );
          })}

          {/* Sticky Logout button at the end */}
          <div className="sticky right-0 h-full bg-gradient-to-l from-black via-black to-transparent pl-4 pr-2 flex items-center justify-center shrink-0">
            <button
              onClick={logout}
              className="flex flex-col items-center justify-center gap-1 w-[50px] h-full text-white/40 hover:text-red-400 transition-all active:scale-90"
            >
              <div className="p-1.5 rounded-xl">
                <LogOut size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider leading-none text-white/30">
                Out
              </span>
            </button>
          </div>
        </div>

        {/* iPhone home indicator spacing */}
        <div className="h-safe-area-inset-bottom" />
        
        {/* CSS to hide scrollbar for horizontal scroll */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
      </nav>
    </>
  );
}
