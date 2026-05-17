"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck, Users, Scissors, Wallet,
  Settings, LogOut, Sparkles, Menu, X, Bell, ChevronRight
} from "lucide-react";
import GlowAuthGuard from "@/components/glow/auth-guard";
import { useGlowAuthStore } from "@/lib/glow-auth-store";

const SALON_LINKS = [
  { href: "/glow/salon/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/glow/salon/appointments", label: "Appointments", icon: CalendarCheck },
  { href: "/glow/salon/staff", label: "Staff", icon: Users },
  { href: "/glow/salon/services", label: "Services", icon: Scissors },
  { href: "/glow/salon/finance", label: "Finance", icon: Wallet },
  { href: "/glow/salon/settings", label: "Settings", icon: Settings },
];

export default function GlowSalonLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useGlowAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/glow/auth/login");
  };

  const initials = user
    ? `${(user.firstName || "S")[0]}${(user.lastName || "O")[0]}`.toUpperCase()
    : "SO";

  return (
    <GlowAuthGuard requireRole={["OWNER", "ADMIN"]}>
      <div className="min-h-screen relative p-3 md:p-6 lg:p-8 flex justify-center items-start font-sans bg-transparent">
        <div className="w-full max-w-[1500px] bg-[#FAF5EE] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 min-h-[900px] border border-white/20 flex">

          {/* ── SIDEBAR ── */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#E8DDD2] flex flex-col
            transform transition-transform duration-300 md:relative md:translate-x-0
            ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
            md:w-64 md:rounded-l-[32px] md:static
          `}>
            {/* Logo */}
            <div className="px-6 py-6 border-b border-[#F0E4D8]">
              <Link href="/glow/salon/dashboard" className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    GlowLink
                  </h1>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#B5A090]">Salon Portal</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#B5A090] px-3 mb-3">Management</p>
              {SALON_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                return (
                  <Link key={link.href} href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#2C2416] text-[#F5EFE6] shadow-lg"
                        : "text-[#7A6350] hover:bg-[#FAF5EE] hover:text-[#2C2416]"
                    }`}>
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{link.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom */}
            <div className="px-4 pb-6 space-y-3">
              {/* User */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FAF5EE] border border-[#E8DDD2]">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#2C2416] truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[10px] text-[#B5A090]">Salon Owner</p>
                </div>
              </div>

              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#B5A090] hover:text-red-500 hover:bg-red-50 transition-all">
                <LogOut className="h-[18px] w-[18px]" />
                <span>Logout</span>
              </button>
            </div>
          </aside>

          {/* Mobile overlay */}
          {mobileOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
          )}

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Top header */}
            <header className="px-6 py-4 bg-white/60 backdrop-blur-md border-b border-[#F0E4D8] flex items-center justify-between sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl bg-[#FAF5EE] border border-[#E8DDD2] text-[#7A6350]">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <div>
                  <h2 className="text-xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {SALON_LINKS.find(l => pathname?.startsWith(l.href))?.label || "Dashboard"}
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">
                    Salon Management
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2.5 rounded-xl bg-[#FAF5EE] border border-[#E8DDD2] text-[#7A6350] relative hover:bg-[#F5EFE6] transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
                </button>
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-sm cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                  {initials}
                </div>
              </div>
            </header>

            {/* Page content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </div>
          </main>

        </div>
      </div>
    </GlowAuthGuard>
  );
}
