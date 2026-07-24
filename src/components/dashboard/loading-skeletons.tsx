"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/[0.06]",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function LoadingSkeletons() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Carregando dashboard">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111315] p-6 sm:p-8">
        <Skeleton className="mb-3 h-4 w-32" />
        <Skeleton className="mb-2 h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-56" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.08] bg-[#111315] p-4"
          >
            <Skeleton className="mb-4 h-3 w-24" />
            <Skeleton className="mb-3 h-8 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>

      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}

export { Skeleton };
