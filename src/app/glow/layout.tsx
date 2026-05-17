import { GlowFloralBackground } from "@/components/glow/animated-background";

export const metadata = {
  title: "GlowLink — Your Glow, Always Connected",
  description: "Ethiopia's premium women's beauty platform. Discover top salons, book appointments, and earn loyalty rewards.",
};

export default function GlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="glow-theme min-h-screen antialiased relative overflow-hidden bg-[#544448]">
      {/* ════════════ ARCHITECTURAL ROOM BACKGROUND ════════════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Wall Paneling Grid */}
        <div className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.3) 3px, transparent 3px),
              linear-gradient(to bottom, rgba(0,0,0,0.3) 3px, transparent 3px)
            `,
            backgroundSize: '250px 200px'
          }}
        />
        {/* Warm Lamp Glow on the Right */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[1000px] bg-[#ffb685] mix-blend-screen opacity-[0.6] filter blur-[150px] rounded-full" />
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] bg-[#ffe4a0] mix-blend-screen opacity-[0.5] filter blur-[120px] rounded-full" />
        
        {/* Subtle cool shadow/light on the left */}
        <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-[#688fb5] mix-blend-screen opacity-30 filter blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
