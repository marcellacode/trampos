import { z } from "zod";
import type { ExtractedProfile, GoalChip } from "@/types/onboarding";

export const goalChipAiSchema = z.object({
  label: z.string().min(1),
  category: z.enum([
    "skill",
    "role",
    "location",
    "salary",
    "contract",
    "model",
  ]),
});

export const interpretGoalsResponseSchema = z.object({
  chips: z.array(goalChipAiSchema),
});

export const extractedProfileAiSchema = z.object({
  name: z.string().min(1),
  currentRole: z.string().default(""),
  summary: z.string().default(""),
  avatarInitials: z.string().default(""),
  seniority: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experiences: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        period: z.string().default(""),
        description: z.string().default(""),
      })
    )
    .default([]),
  languages: z
    .array(
      z.object({
        name: z.string(),
        level: z.string().default(""),
      })
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().default(""),
        tech: z.array(z.string()).default([]),
      })
    )
    .default([]),
  certificates: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string().default(""),
        year: z.string().default(""),
      })
    )
    .default([]),
});

export const aiSuggestionSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  actionLabel: z.string().default(""),
  type: z.enum(["github", "linkedin", "skill", "project", "experience"]),
});

export const onboardingCompleteResponseSchema = z.object({
  suggestions: z.array(aiSuggestionSchema).default([]),
  predominantProfile: z.string().optional(),
  strengths: z.array(z.string()).default([]),
});

export function mapAiChipsToGoalChips(
  chips: z.infer<typeof goalChipAiSchema>[]
): GoalChip[] {
  return chips.map((chip, index) => ({
    id: `chip-${chip.category}-${index}-${chip.label.toLowerCase().replace(/\s+/g, "-")}`,
    label: chip.label,
    category: chip.category,
  }));
}

export function mapAiProfileToExtracted(
  raw: z.infer<typeof extractedProfileAiSchema>
): ExtractedProfile {
  const initials =
    raw.avatarInitials ||
    raw.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

  return {
    name: raw.name,
    currentRole: raw.currentRole,
    summary: raw.summary,
    avatarInitials: initials,
    seniority: raw.seniority,
    skills: raw.skills,
    experiences: raw.experiences.map((exp, index) => ({
      id: `exp-${index}`,
      company: exp.company,
      role: exp.role,
      period: exp.period,
      description: exp.description,
    })),
    languages: raw.languages.map((lang, index) => ({
      id: `lang-${index}`,
      name: lang.name,
      level: lang.level,
    })),
    projects: raw.projects.map((project, index) => ({
      id: `proj-${index}`,
      name: project.name,
      description: project.description,
      tech: project.tech,
    })),
    certificates: raw.certificates.map((cert, index) => ({
      id: `cert-${index}`,
      name: cert.name,
      issuer: cert.issuer,
      year: cert.year,
    })),
  };
}

export const universalSearchResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("navigate"),
    href: z.string(),
    message: z.string().optional(),
  }),
  z.object({
    type: z.literal("answer"),
    content: z.string(),
  }),
]);

export type UniversalSearchResult = z.infer<
  typeof universalSearchResponseSchema
>;
