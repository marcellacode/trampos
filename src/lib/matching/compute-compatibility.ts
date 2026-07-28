import type { SupabaseClient } from "@supabase/supabase-js";
import { chatCompletion } from "@/lib/ai/groq";
import { isGroqConfigured } from "@/lib/ai/env";
import type { ExtractedProfile } from "@/types/onboarding";
import type { JobRecommendation } from "@/types/jobs";
import { fetchProfileData } from "@/lib/supabase/queries/profile";
import {
  matchesLocation,
  matchesRole,
  matchesSalary,
  matchesSeniority,
} from "@/lib/matching/heuristics";
import type {
  ComputedMatch,
  GroqMatchResponse,
  ProfileGoals,
} from "@/lib/matching/types";

export type { ComputedMatch, ProfileGoals };

function heuristicMatch(
  job: Pick<
    JobRecommendation,
    "role" | "location" | "salaryMax" | "remote" | "stack" | "aiSummary"
  >,
  goals: ProfileGoals,
  profile: ExtractedProfile | null
): ComputedMatch {
  let score = 45;
  const reasons: ComputedMatch["reasons"] = [];

  if (goals.role && matchesRole(job.role, goals.role)) {
    score += 20;
    reasons.push({ text: `Cargo alinhado com "${goals.role}"`, type: "match" });
  } else if (goals.role) {
    reasons.push({ text: "Cargo parcialmente diferente do objetivo", type: "warning" });
  }

  if (goals.location && matchesLocation(job, goals.location)) {
    score += 15;
    reasons.push({ text: "Localização compatível", type: "match" });
  }

  if (goals.seniority && matchesSeniority(job.role, goals.seniority)) {
    score += 10;
    reasons.push({ text: "Senioridade compatível", type: "match" });
  }

  if (goals.salary && matchesSalary(job, goals.salary)) {
    score += 10;
    reasons.push({ text: "Faixa salarial dentro da expectativa", type: "match" });
  }

  const profileSkills = profile?.skills ?? [];
  const jobStack = job.stack.map((s) => s.toLowerCase());
  const skillHits = profileSkills.filter((skill) =>
    jobStack.some((tech) => tech.includes(skill.toLowerCase()))
  );
  if (skillHits.length > 0) {
    score += Math.min(skillHits.length * 5, 15);
    reasons.push({
      text: `Skills em comum: ${skillHits.slice(0, 3).join(", ")}`,
      type: "match",
    });
  }

  const compatibility = Math.min(Math.max(score, 0), 100);
  const approvalLevel =
    compatibility >= 80 ? "alta" : compatibility >= 60 ? "media" : "baixa";
  const approvalStars =
    compatibility >= 85 ? 5 : compatibility >= 70 ? 4 : compatibility >= 55 ? 3 : 2;

  return {
    compatibility,
    approvalLevel,
    approvalStars,
    reasons: reasons.slice(0, 4),
    aiSummary: job.aiSummary?.slice(0, 200) || "Vaga analisada com base no seu perfil.",
    bestSendDayLabel: "Terça",
    bestSendTimeRange: "9h–11h",
  };
}

async function groqMatch(
  job: Pick<JobRecommendation, "role" | "company" | "location" | "stack" | "aiSummary">,
  profile: ExtractedProfile | null,
  goals: ProfileGoals,
  heuristic: ComputedMatch
): Promise<ComputedMatch> {
  const raw = await chatCompletion(
    [
      {
        role: "system",
        content: `Analise compatibilidade candidato × vaga. Retorne JSON:
{ "compatibility": 0-100, "approvalLevel": "baixa"|"media"|"alta", "approvalStars": 1-5,
  "reasons": [{ "text": string, "type": "match"|"warning" }],
  "aiSummary": string (1 frase), "bestSendDayLabel": string, "bestSendTimeRange": string }
PT-BR. Seja realista.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          job: {
            role: job.role,
            company: job.company,
            location: job.location,
            stack: job.stack,
            summary: job.aiSummary,
          },
          profile: profile
            ? {
                role: profile.currentRole,
                seniority: profile.seniority,
                skills: profile.skills.slice(0, 15),
                experiences: profile.experiences.slice(0, 5).map((exp) => ({
                  company: exp.company,
                  role: exp.role,
                })),
                summary: profile.summary,
              }
            : null,
          goals,
          heuristicScore: heuristic.compatibility,
        }),
      },
    ],
    { jsonMode: true, temperature: 0.2, maxTokens: 800 }
  );

  const parsed = JSON.parse(raw) as GroqMatchResponse;
  return {
    compatibility: Math.min(100, Math.max(0, parsed.compatibility ?? heuristic.compatibility)),
    approvalLevel: parsed.approvalLevel ?? heuristic.approvalLevel,
    approvalStars: parsed.approvalStars ?? heuristic.approvalStars,
    reasons: parsed.reasons?.length ? parsed.reasons.slice(0, 4) : heuristic.reasons,
    aiSummary: parsed.aiSummary ?? heuristic.aiSummary,
    bestSendDayLabel: parsed.bestSendDayLabel ?? heuristic.bestSendDayLabel,
    bestSendTimeRange: parsed.bestSendTimeRange ?? heuristic.bestSendTimeRange,
  };
}

export async function computeJobMatch(
  job: JobRecommendation,
  profile: ExtractedProfile | null,
  goals: ProfileGoals
): Promise<ComputedMatch> {
  const heuristic = heuristicMatch(job, goals, profile);

  if (!isGroqConfigured()) return heuristic;

  try {
    return await groqMatch(job, profile, goals, heuristic);
  } catch {
    return heuristic;
  }
}

export async function loadProfileGoals(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileGoals> {
  const { data } = await supabase
    .from("profiles")
    .select("goal_role, goal_location, goal_salary, seniority")
    .eq("id", userId)
    .maybeSingle();

  return {
    role: data?.goal_role || undefined,
    location: data?.goal_location || undefined,
    salary: data?.goal_salary || undefined,
    seniority: data?.seniority || undefined,
  };
}

export async function loadUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<ExtractedProfile | null> {
  try {
    return await fetchProfileData(supabase, userId);
  } catch {
    return null;
  }
}
