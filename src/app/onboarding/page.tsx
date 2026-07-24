import type { Metadata } from "next";
import { OnboardingPage } from "@/components/onboarding/onboarding-page";

export const metadata: Metadata = {
  title: "Onboarding — TramplyAI",
  description:
    "Construa seu copiloto de carreira em poucos minutos. A IA analisa seu perfil e começa a buscar oportunidades.",
};

export default function Page() {
  return <OnboardingPage />;
}
