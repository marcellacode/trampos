import type { ExtractedProfile } from "@/types/onboarding";

export function buildScratchProfile(): ExtractedProfile {
  return {
    name: "Seu Nome",
    currentRole: "Profissional em transição",
    summary:
      "Estamos construindo seu perfil do zero. Complete as próximas etapas para a IA conhecer sua carreira.",
    avatarInitials: "EU",
    experiences: [],
    skills: [],
    languages: [{ id: "lang-pt", name: "Português", level: "Nativo" }],
    projects: [],
    certificates: [],
    seniority: "A definir",
  };
}
