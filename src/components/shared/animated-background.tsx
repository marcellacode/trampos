export function AnimatedBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden landing-mesh"
      aria-hidden="true"
    >
      <div className="animate-orb-float absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-primary/15 blur-[80px]" />
      <div className="animate-orb-float-reverse absolute top-1/2 right-0 h-64 w-64 rounded-full bg-glow/10 blur-[70px]" />
    </div>
  );
}
