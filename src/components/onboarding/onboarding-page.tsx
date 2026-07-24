"use client";

import { OnboardingQueryProvider } from "@/components/onboarding/query-provider";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export function OnboardingPage() {
  return (
    <OnboardingQueryProvider>
      <OnboardingFlow />
    </OnboardingQueryProvider>
  );
}
