"use client";

export function GlowAnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ background: "#0F0818" }}>

      {/* ── Base radial gradient foundation ── */}
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(200,149,108,0.18) 0%, transparent 60%)" }} />
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 100% 100%, rgba(180,60,140,0.12) 0%, transparent 55%)" }} />
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 50% at 0% 60%, rgba(80,40,160,0.1) 0%, transparent 50%)" }} />

      {/* ── Animated ambient blobs ── */}
      <div className="absolute -top-[15%] -left-[5%] w-[55vw] h-[55vw] rounded-full animate-blob"
        style={{ background: "radial-gradient(circle, rgba(200,149,108,0.22) 0%, transparent 70%)", filter: "blur(60px)", animationDuration: "14s" }} />
      <div className="absolute top-[30%] -right-[10%] w-[50vw] h-[50vw] rounded-full animate-blob"
        style={{ background: "radial-gradient(circle, rgba(232,121,249,0.14) 0%, transparent 70%)", filter: "blur(70px)", animationDelay: "5s", animationDuration: "18s" }} />
      <div className="absolute -bottom-[10%] left-[20%] w-[45vw] h-[45vw] rounded-full animate-blob"
        style={{ background: "radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)", filter: "blur(65px)", animationDelay: "9s", animationDuration: "16s" }} />
      <div className="absolute top-[60%] left-[5%] w-[30vw] h-[30vw] rounded-full animate-blob"
        style={{ background: "radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)", filter: "blur(55px)", animationDelay: "3s", animationDuration: "20s" }} />

      {/* ── Scrolling card tracks (desktop only) ── */}
      <div className="hidden md:flex absolute inset-0 flex-col justify-around rotate-[10deg] scale-[1.6] opacity-20">
        {/* Track 1 — left scroll */}
        <div className="flex gap-5 glow-track-left">
          {Array.from({ length: 12 }, (_, i) => {
            const colors = [
              ["rgba(200,149,108,0.35)", "rgba(139,58,98,0.35)"],
              ["rgba(232,121,249,0.3)", "rgba(124,58,237,0.3)"],
              ["rgba(244,63,94,0.3)",  "rgba(157,23,77,0.3)"],
              ["rgba(124,185,154,0.3)","rgba(6,95,70,0.3)"],
              ["rgba(129,140,248,0.3)","rgba(196,181,253,0.25)"],
              ["rgba(255,215,0,0.25)", "rgba(253,230,138,0.2)"],
            ];
            const [c1, c2] = colors[i % colors.length];
            return (
              <div key={i} className="w-56 h-56 shrink-0 rounded-3xl border"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, borderColor: `${c1.replace(/,[^,]+\)$/, ",0.2)")}` }} />
            );
          })}
        </div>
        {/* Track 2 — right scroll */}
        <div className="flex gap-5 glow-track-right">
          {Array.from({ length: 12 }, (_, i) => {
            const colors = [
              ["rgba(124,185,154,0.3)", "rgba(6,95,70,0.3)"],
              ["rgba(200,149,108,0.3)", "rgba(232,121,249,0.25)"],
              ["rgba(129,140,248,0.3)", "rgba(244,63,94,0.25)"],
              ["rgba(255,215,0,0.25)",  "rgba(200,149,108,0.3)"],
              ["rgba(244,63,94,0.28)",  "rgba(232,121,249,0.25)"],
              ["rgba(196,181,253,0.25)","rgba(129,140,248,0.3)"],
            ];
            const [c1, c2] = colors[i % colors.length];
            return (
              <div key={i} className="w-72 h-48 shrink-0 rounded-3xl border"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, borderColor: `${c1.replace(/,[^,]+\)$/, ",0.2)")}` }} />
            );
          })}
        </div>
        {/* Track 3 — left scroll, slower */}
        <div className="flex gap-5" style={{ animation: "glowTrackLeft 80s linear infinite" }}>
          {Array.from({ length: 12 }, (_, i) => {
            const colors = [
              ["rgba(232,121,249,0.28)", "rgba(200,149,108,0.25)"],
              ["rgba(244,63,94,0.25)",   "rgba(129,140,248,0.25)"],
              ["rgba(200,149,108,0.3)",  "rgba(124,185,154,0.25)"],
              ["rgba(255,215,0,0.2)",    "rgba(232,121,249,0.25)"],
            ];
            const [c1, c2] = colors[i % colors.length];
            return (
              <div key={i} className="w-48 h-64 shrink-0 rounded-3xl border"
                style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, borderColor: `${c1.replace(/,[^,]+\)$/, ",0.15)")}` }} />
            );
          })}
        </div>
      </div>

      {/* ── Noise texture overlay ── */}
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "128px" }} />

      {/* ── Final darkening veil so content stays readable ── */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(15,8,24,0.3) 0%, rgba(15,8,24,0.1) 40%, rgba(15,8,24,0.4) 100%)" }} />
    </div>
  );
}
