import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/app/providers";
import { AnimatedBackground } from "@/components/common/animated-background";
import { ChatWidget } from "@/components/common/chat-widget";
import "@/index.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
});

export const metadata: Metadata = {
  title: "TrimLink",
  description:
    "Premium barbershop booking, queue, and payment platform for Ethiopia.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-sans`}>
        <Providers>
          <AnimatedBackground />
          <div className="relative z-10 w-full h-full min-h-screen">
            {children}
          </div>
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
