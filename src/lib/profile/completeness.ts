import type { LivingProfile } from "@/types/career-context";
import type { CareerGoal } from "@/types/dashboard";

export interface ProfileCompletenessInput {
  fullName?: string | null;
  summary?: string | null;
  currentRole?: string | null;
  goalRole?: string | null;
  goalLocation?: string | null;
  experiencesCount: number;
  skillsCount: number;
  educationCount: number;
  languagesCount: number;
}

const FIELD_WEIGHTS = {
  name: 15,
  summary: 15,
  currentRole: 10,
  goalRole: 15,
  goalLocation: 10,
  experiences: 20,
  skills: 10,
  education: 5,
} as const;

export function computeProfileCompleteness(
  input: ProfileCompletenessInput
): Pick<LivingProfile, "completeness" | "missingFields"> {
  let score = 0;
  const missing: string[] = [];

  if (input.fullName?.trim()) {
    score += FIELD_WEIGHTS.name;
  } else {
    missing.push("Nome completo");
  }

  if (input.summary?.trim()) {
    score += FIELD_WEIGHTS.summary;
  } else {
    missing.push("Resumo profissional");
  }

  if (input.currentRole?.trim()) {
    score += FIELD_WEIGHTS.currentRole;
  } else {
    missing.push("Cargo atual");
  }

  if (input.goalRole?.trim()) {
    score += FIELD_WEIGHTS.goalRole;
  } else {
    missing.push("Objetivo de cargo");
  }

  if (input.goalLocation?.trim()) {
    score += FIELD_WEIGHTS.goalLocation;
  } else {
    missing.push("Localização desejada");
  }

  if (input.experiencesCount > 0) {
    score += FIELD_WEIGHTS.experiences;
  } else {
    missing.push("Experiências profissionais");
  }

  if (input.skillsCount > 0) {
    score += FIELD_WEIGHTS.skills;
  } else {
    missing.push("Habilidades");
  }

  if (input.educationCount > 0) {
    score += FIELD_WEIGHTS.education;
  } else {
    missing.push("Formação acadêmica");
  }

  return {
    completeness: Math.min(100, score),
    missingFields: missing,
  };
}

export function buildLivingProfile(
  input: ProfileCompletenessInput & {
    goals: CareerGoal;
    hasSummary: boolean;
    lastUpdated?: string | null;
  }
): LivingProfile {
  const { completeness, missingFields } = computeProfileCompleteness(input);

  return {
    completeness,
    missingFields,
    hasExperiences: input.experiencesCount > 0,
    hasSkills: input.skillsCount > 0,
    hasSummary: input.hasSummary,
    goals: input.goals,
    lastUpdated: input.lastUpdated ?? null,
  };
}
