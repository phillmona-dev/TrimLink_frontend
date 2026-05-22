"use client";

/** The BeauLink gateway outer room/studio background — used for ALL TrimLink pages */
function TrimLinkDashboardBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base room color — matches the gateway outer container exactly */}
      <div className="absolute inset-0 bg-[#544448]" />

      {/* Architectural wall-panel grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.3) 3px, transparent 3px),
            linear-gradient(to bottom, rgba(0,0,0,0.3) 3px, transparent 3px)
          `,
          backgroundSize: "250px 200px",
        }}
      />

      {/* Warm lamp glow — top right (amber/cream) */}
      <div
        className="absolute top-[-10%] right-[-10%] w-[800px] h-[1000px] rounded-full"
        style={{
          background: "#ffb685",
          mixBlendMode: "screen",
          opacity: 0.6,
          filter: "blur(150px)",
        }}
      />
      <div
        className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] rounded-full"
        style={{
          background: "#ffe4a0",
          mixBlendMode: "screen",
          opacity: 0.5,
          filter: "blur(120px)",
        }}
      />

      {/* Cool shadow — bottom left (blue-grey) */}
      <div
        className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] rounded-full"
        style={{
          background: "#688fb5",
          mixBlendMode: "screen",
          opacity: 0.3,
          filter: "blur(150px)",
        }}
      />
    </div>
  );
}

export function AnimatedBackground() {
  // All TrimLink pages — home, auth/login, dashboard — use the BeauLink gateway room background
  return <TrimLinkDashboardBackground />;
}
