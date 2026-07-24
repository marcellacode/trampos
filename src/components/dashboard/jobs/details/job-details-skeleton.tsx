"use client";

export function JobDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-4 w-64 rounded bg-white/[0.06]" />
        <div className="h-8 w-20 rounded-lg bg-white/[0.04]" />
      </div>
      <div className="h-48 rounded-2xl bg-white/[0.04]" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="h-72 rounded-2xl bg-white/[0.03]" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/[0.03]" />
            ))}
          </div>
          <div className="h-56 rounded-2xl bg-white/[0.03]" />
          <div className="h-64 rounded-2xl bg-white/[0.03]" />
        </div>
        <div className="hidden h-96 rounded-2xl bg-white/[0.03] lg:block" />
      </div>
    </div>
  );
}
