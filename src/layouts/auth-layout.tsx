import Link from "next/link";
import { LogoMark } from "@/components/common/logo-mark";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSwitcher } from "@/components/common/language-switcher";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col text-white">
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 md:px-8 md:py-4 bg-black/40 backdrop-blur-2xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition text-white/70 hover:text-white group text-sm"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline font-medium">Home</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <LogoMark />
            <div>
              <div className="font-black text-white/90 text-sm">TrimLink</div>
              <div className="text-[10px] text-white/50">Access your workspace</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col lg:flex-row items-stretch">

        {/* Left decorative panel — hidden on mobile/tablet, shows on lg+ */}
        <div className="hidden lg:flex flex-col justify-center flex-1 px-16 xl:px-24 py-12 border-r border-white/5">
          <div className="max-w-lg">
            <p className="mb-6 inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-orange-400">
              Frictionless bookings
            </p>
            <h1 className="text-4xl xl:text-5xl font-normal tracking-tight leading-tight text-white/90">
              Appointments, live queues, and Ethiopian payments in one premium experience.
            </h1>
            <p className="mt-6 text-sm leading-8 text-white/60">
              Customers move faster, barbers stay in control, and owners finally get a clean
              operational view of the business.
            </p>
          </div>
        </div>

        {/* Right form panel — full-width on mobile */}
        <div className="flex flex-col justify-center items-center flex-1 px-4 py-8 sm:px-8 lg:px-12 xl:px-16 min-h-[calc(100vh-61px)]">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
