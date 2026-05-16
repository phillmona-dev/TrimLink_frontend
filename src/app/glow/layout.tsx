import { GlowAnimatedBackground } from "@/components/glow/animated-background";

export const metadata = {
  title: "GlowLink — Your Glow, Always Connected",
  description: "Ethiopia's premium women's beauty platform. Discover top salons, book appointments, shop beauty products, and earn loyalty rewards.",
};

export default function GlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="glow-theme min-h-screen antialiased" style={{ background: "#0F0818" }}>
      <GlowAnimatedBackground />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
