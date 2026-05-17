"use client";

// Soft warm floral decorative background — replaces the dark animated blob layer
export function GlowFloralBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Warm amber blob — top right */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.12]"
        style={{ background: "radial-gradient(circle, #D4864A, transparent 70%)", filter: "blur(60px)" }}
      />
      {/* Blush blob — bottom left */}
      <div
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-[0.10]"
        style={{ background: "radial-gradient(circle, #D4847A, transparent 70%)", filter: "blur(60px)" }}
      />
      {/* Warm gold blob — mid left */}
      <div
        className="absolute top-1/2 -left-16 w-64 h-64 rounded-full opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #C8956C, transparent 70%)", filter: "blur(50px)" }}
      />
      {/* Sage blob — mid right */}
      <div
        className="absolute top-1/3 -right-10 w-56 h-56 rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #7A9E7E, transparent 70%)", filter: "blur(50px)" }}
      />

      {/* Floating petal shapes */}
      {[
        { top: "8%",  left: "12%",  size: 24, delay: "0s",   color: "#D4864A" },
        { top: "18%", left: "82%",  size: 18, delay: "1.5s", color: "#D4847A" },
        { top: "42%", left: "6%",   size: 20, delay: "3s",   color: "#C8956C" },
        { top: "60%", left: "90%",  size: 16, delay: "2s",   color: "#7A9E7E" },
        { top: "75%", left: "30%",  size: 14, delay: "4s",   color: "#D4864A" },
        { top: "85%", left: "70%",  size: 22, delay: "1s",   color: "#D4847A" },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute animate-petal"
          style={{
            top: p.top, left: p.left,
            animationDelay: p.delay,
            animationDuration: `${6 + i * 1.2}s`,
            width: p.size, height: p.size,
            opacity: 0.07,
          }}
        >
          <svg viewBox="0 0 24 24" fill={p.color} xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C12 2 8 6 8 10C8 12.2 9.8 14 12 14C14.2 14 16 12.2 16 10C16 6 12 2 12 2Z"/>
            <path d="M12 22C12 22 16 18 16 14C16 11.8 14.2 10 12 10C9.8 10 8 11.8 8 14C8 18 12 22 12 22Z" opacity="0.6"/>
            <path d="M2 12C2 12 6 8 10 8C12.2 8 14 9.8 14 12C14 14.2 12.2 16 10 16C6 16 2 12 2 12Z" opacity="0.4"/>
            <path d="M22 12C22 12 18 16 14 16C11.8 16 10 14.2 10 12C10 9.8 11.8 8 14 8C18 8 22 12 22 12Z" opacity="0.4"/>
          </svg>
        </div>
      ))}

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #D4864A 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

// Keep old export name for backward compat
export const GlowAnimatedBackground = GlowFloralBackground;
