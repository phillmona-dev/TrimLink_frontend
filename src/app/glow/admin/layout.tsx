"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Building2, Wallet, 
  Settings, LogOut, Sparkles, ChevronRight, Menu, X, Bell,
  CalendarCheck, ShieldCheck
} from "lucide-react";
import GlowAuthGuard from "@/components/glow/auth-guard";
import { useGlowAuthStore } from "@/lib/glow-auth-store";

const ADMIN_LINKS = [
  { href: "/glow/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/glow/admin/approvals", label: "Approvals", icon: Users },
  { href: "/glow/admin/salons", label: "All Salons", icon: Building2 },
  { href: "/glow/admin/appointments", label: "Bookings", icon: CalendarCheck },
  { href: "/glow/admin/finance", label: "Finance", icon: Wallet },
  { href: "/glow/admin/users", label: "Users", icon: Users },
  { href: "/glow/admin/audit-logs", label: "Audit Logs", icon: ShieldCheck },
  { href: "/glow/admin/settings", label: "Settings", icon: Settings },
];

export default function GlowAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useGlowAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/glow/auth/login");
  };

  const initials = user ? `${(user.firstName || "A")[0]}${(user.lastName || "D")[0]}`.toUpperCase() : "AD";

  return (
    <GlowAuthGuard requireRole={["ADMIN"]}>
      <div className="min-h-screen bg-[#F5EFE6] flex font-sans">
        
        {/* Mobile menu overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* ═══════ SIDEBAR ═══════ */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:shadow-none lg:border-r border-[#E8DDD2]
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          
          <div className="h-20 px-8 flex items-center justify-between border-b border-[#E8DDD2]">
            <Link href="/glow/admin/dashboard" className="flex items-center gap-2 group">
              <span className="text-[#D4864A] text-2xl group-hover:rotate-12 transition-transform">✦</span>
              <span className="text-2xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                GlowAdmin
              </span>
            </Link>
            <button className="lg:hidden p-2 text-[#7A6350]" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-4">Management</p>
            <nav className="flex flex-col gap-1.5">
              {ADMIN_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all
                      ${isActive 
                        ? "bg-[#FFF0E8] text-[#D4864A] shadow-sm border border-[#FADEC9]" 
                        : "text-[#7A6350] hover:bg-[#FAF5EE] hover:text-[#2C2416] border border-transparent"}
                    `}>
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                  </Link>
                );
              })}
            </nav>
            
            <div className="mt-8 px-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2C2416] to-[#4A3D2A] text-white relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-white/5 rounded-full blur-xl" />
                <Sparkles className="h-5 w-5 text-[#D4864A] mb-2" />
                <h4 className="font-bold text-sm mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Admin Power</h4>
                <p className="text-xs text-white/60 leading-relaxed">You have full access to manage GlowLink properties and users.</p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[#E8DDD2]">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-[#D47A7A] hover:bg-[#FFF0F0] transition-colors">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ═══════ MAIN CONTENT ═══════ */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          
          {/* Top Header */}
          <header className="h-20 bg-white/60 backdrop-blur-md border-b border-[#E8DDD2] flex items-center justify-between px-6 md:px-10 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 rounded-xl bg-white border border-[#E8DDD2] text-[#7A6350]" 
                onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-[#2C2416] hidden sm:block" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {ADMIN_LINKS.find(l => pathname.startsWith(l.href))?.label || "Admin Portal"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-full bg-white text-[#B5A090] hover:text-[#D4864A] border border-[#E8DDD2] hover:border-[#FADEC9] transition-all relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-400 border-2 border-white" />
              </button>
              
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ml-2 border-2 border-white cursor-pointer hover:scale-105 transition-transform"
                style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                {initials}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
          
        </main>

      </div>
    </GlowAuthGuard>
  );
}
