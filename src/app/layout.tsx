import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { TrimShell } from "@/components/common/trim-shell";
import "@/index.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta"
});

export const metadata: Metadata = {
  title: "BeauLink — TrimLink & GlowLink",
  description:
    "Ethiopia's premium beauty ecosystem. TrimLink for men's grooming, GlowLink for women's beauty.",
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
        <TrimShell>
          {children}
        </TrimShell>
      </body>
    </html>
  );
}
