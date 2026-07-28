"use client";

export function LandingBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background landing-mesh"
      aria-hidden="true"
    >
      <div className="animate-orb-float absolute -top-32 left-1/4 h-[480px] w-[480px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="animate-orb-float-reverse absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-glow/15 blur-[100px]" />
      <div className="animate-orb-float absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_100%)]" />
    </div>
  );
}
