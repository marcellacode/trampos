"use client";

import Link from "next/link";
import type { TimelineActivity } from "@/types/dashboard";
import { actorLabel } from "@/lib/dashboard/timeline";
import { useLiveTimeline } from "@/lib/dashboard/use-live-timeline";
import { cn } from "@/lib/utils";

interface TimelineProps {
  items: TimelineActivity[];
  className?: string;
}

export function Timeline({ items: seed, className }: TimelineProps) {
  const items = useLiveTimeline({ seed });

  return (
    <section
      className={cn("rounded-lg border border-border bg-card", className)}
      aria-labelledby="timeline-heading"
    >
      <div className="border-b border-border px-4 py-4 sm:px-6">
        <h2 id="timeline-heading" className="text-base font-bold text-foreground">
          Atividade recente
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Buscas, candidaturas e atualizações da sua conta
        </p>
      </div>

      <ol className="divide-y divide-border" role="list">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex gap-4 px-4 py-4 transition-colors hover:bg-muted/50 sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <time dateTime={item.createdAt}>{item.time}</time>
                  <span>·</span>
                  <span>{actorLabel(item.actor)}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {item.title}
                </p>
                {item.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
