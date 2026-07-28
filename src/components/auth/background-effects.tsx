export function BackgroundEffects() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden landing-mesh"
      aria-hidden="true"
    >
      <div className="animate-orb-float absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/18 blur-[110px]" />
      <div className="animate-orb-float-reverse absolute top-1/3 -right-24 h-[340px] w-[340px] rounded-full bg-glow/12 blur-[90px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,var(--background)_100%)]" />
    </div>
  );
}
