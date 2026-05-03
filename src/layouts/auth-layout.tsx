import Link from "next/link";
import { LogoMark } from "@/components/common/logo-mark";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSwitcher } from "@/components/common/language-switcher";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 lg:p-12 text-white">
      <div className="flex w-full max-w-6xl h-[85vh] items-center">
        {/* Main Glass Container */}
        <main className="flex-1 h-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] rounded-[2.5rem] overflow-hidden flex flex-col relative">
          
          {/* Subtle inner glass highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none rounded-[2.5rem]"></div>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col custom-scrollbar relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition text-white/70 hover:text-white group">
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="text-sm font-medium">Home</span>
                </Link>
                <div className="hidden sm:flex items-center gap-3">
                  <LogoMark />
                  <div>
                    <div className="font-black text-white/90">TrimLink</div>
                    <div className="text-xs text-white/50">Access your workspace</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>

            <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="hidden lg:block">
                <div className="max-w-xl">
                  <p className="mb-4 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-orange-400">
                    Frictionless bookings
                  </p>
                  <h1 className="text-5xl font-normal tracking-tight leading-tight text-white/90">
                    Appointments, live queues, and Ethiopian payments in one premium experience.
                  </h1>
                  <p className="mt-6 max-w-lg text-sm leading-8 text-white/60">
                    Customers move faster, staffs stay in control, and owners finally get a clean
                    operational view of the business.
                  </p>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                {children}
              </div>
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
