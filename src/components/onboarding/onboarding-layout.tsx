"use client";

import { type ReactNode } from "react";
import { BackgroundEffects } from "@/components/auth/background-effects";
import { ProgressHeader } from "@/components/onboarding/progress-header";
import { cn } from "@/lib/utils";

interface OnboardingLayoutProps {
  step: number;
  totalSteps?: number;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  hideProgress?: boolean;
}

export function OnboardingLayout({
  step,
  totalSteps = 6,
  children,
  className,
  contentClassName,
  hideProgress = false,
}: OnboardingLayoutProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-dvh flex-col overflow-hidden bg-[#08090A]",
        className
      )}
    >
      <BackgroundEffects />

      <div className="relative z-10 flex min-h-dvh flex-col">
        {!hideProgress && (
          <ProgressHeader step={step} totalSteps={totalSteps} />
        )}

        <main
          className={cn(
            "mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-10 pt-4 sm:px-6 sm:pb-12 sm:pt-6 lg:px-8",
            contentClassName
          )}
          id="onboarding-main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
