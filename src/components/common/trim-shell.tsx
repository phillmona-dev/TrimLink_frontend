"use client";

import { usePathname } from "next/navigation";
import { Providers } from "@/app/providers";
import { AnimatedBackground } from "@/components/common/animated-background";
import { ChatWidget } from "@/components/common/chat-widget";

/**
 * Wraps children with TrimLink-specific providers, background, and chat widget
 * only when NOT on a /glow route or the gateway root page.
 */
export function TrimShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isGlow = pathname.startsWith("/glow");
  const isGateway = pathname === "/";

  // Glow routes and gateway don't need TrimLink providers/background
  if (isGlow || isGateway) {
    return <>{children}</>;
  }

  return (
    <Providers>
      <AnimatedBackground />
      <div className="relative z-10 w-full h-full min-h-screen">
        {children}
      </div>
      <ChatWidget />
    </Providers>
  );
}
