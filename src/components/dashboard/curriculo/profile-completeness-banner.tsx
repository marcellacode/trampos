"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LivingProfile } from "@/types/career-context";
import { cn } from "@/lib/utils";

interface ProfileCompletenessBannerProps {
  profile: LivingProfile;
  className?: string;
}

export function ProfileCompletenessBanner({
  profile,
  className,
}: ProfileCompletenessBannerProps) {
  if (profile.completeness >= 90) return null;

  const nextField = profile.missingFields[0];

  return (
    <section
      className={cn(
        "rounded-2xl border border-primary/20 bg-primary/5 p-5",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">
              Currículo vivo · {profile.completeness}% completo
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${profile.completeness}%` }}
            />
          </div>
          {nextField ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Próximo passo: adicionar <strong className="text-foreground">{nextField}</strong>{" "}
              para aumentar matches de vaga.
            </p>
          ) : null}
        </div>

        <Button
          render={<Link href="/dashboard/objetivos" />}
          nativeButton={false}
          size="sm"
          className="shrink-0"
        >
          Completar perfil
        </Button>
      </div>
    </section>
  );
}
