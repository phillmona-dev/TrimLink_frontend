"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/common/button";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { LogoMark } from "@/components/common/logo-mark";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/utils/cn";

const navItems = [
  { label: "Benefits", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" }
];

export function Navbar() {
  const { t } = useTranslation();
  const setMobileSidebarOpen = useAppStore((state) => state.setMobileSidebarOpen);

  return (
    <header className="sticky top-0 z-40 w-full bg-black/50 backdrop-blur-md">
      <div className="container flex h-24 items-center justify-between gap-4">
        <Link className="flex items-center gap-3" href="/">
          <LogoMark />
          <div>
            <div className="text-2xl font-black tracking-tight">{t("common.appName")}</div>
            <div className="text-base text-muted-foreground">Simple barber booking</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <a
              className="text-sm font-medium text-white/80 transition hover:text-white"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button asChild variant="outline" className="px-8 h-10 rounded-full border-white/40 text-sm">
            <Link href="/auth/register">Sign Up</Link>
          </Button>
          <Button asChild variant="outline" className="px-8 h-10 rounded-full border-white/40 text-sm">
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>

        <Button
          className="md:hidden"
          variant="outline"
          size="icon"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

export function SidebarNavLink({
  to,
  label,
  icon: Icon
}: {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const isActive = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Link
      href={to}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
        isActive
          ? "bg-primary text-primary-foreground shadow-lift"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
