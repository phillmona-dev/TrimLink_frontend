"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CalendarDays, Clock, Home, LayoutDashboard, LogOut, Scissors, Settings, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AnimatedIcon } from "@/components/common/animated-icon";

export function Sidebar() {
  const { role, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <aside className="relative z-50 hidden md:flex flex-col items-center gap-6 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-full py-8 px-4 w-16 shrink-0 h-fit min-h-[500px]" />
    );
  }

  const links =
    role === "STAFF"
      ? [
          { to: "/staff", label: "Dashboard", icon: LayoutDashboard },
          { to: "/staffs/queue", label: "Queue", icon: Clock },
          { to: "/staffs/services", label: "Services", icon: Scissors },
          { to: "/staffs/reviews", label: "Reviews", icon: Bell },
          { to: "/staffs/settings", label: "Settings", icon: Settings }
        ]
      : role === "OWNER"
        ? [
            { to: "/owner", label: "Overview", icon: LayoutDashboard },
            { to: "/owner/staff", label: "Staff", icon: Users },
            { to: "/owner/catalog", label: "Catalog", icon: Scissors },
            { to: "/owner/services", label: "Staff Services", icon: Users },
            { to: "/staffs/queue", label: "Queue", icon: Clock },
            { to: "/owner/bookings", label: "Bookings", icon: CalendarDays },
            { to: "/owner/settings", label: "Settings", icon: Settings }
          ]
        : role === "ADMIN"
          ? [
              { to: "/admin", label: "Overview", icon: LayoutDashboard },
              { to: "/admin/users", label: "Users", icon: Users },
              { to: "/admin/shops", label: "Shops", icon: Home },
              { to: "/admin/settings", label: "Settings", icon: Settings }
            ]
          : [
              { to: "/app", label: "Home", icon: Home },
              { to: "/app/appointments", label: "Appointments", icon: CalendarDays },
              { to: "/app/queue", label: "Queue", icon: Clock },
              { to: "/app/profile", label: "Profile", icon: Settings }
            ];

  return (
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
  );
}
