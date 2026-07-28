"use server";

import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { chatCompletion } from "@/lib/ai/groq";
import { isGroqConfigured } from "@/lib/ai/env";
import { prepareApplication } from "@/lib/integrations/ats/application-service";
import { loadUserProfile } from "@/lib/matching/compute-compatibility";
import type { ActionResult } from "@/app/actions/ai";
import type { JobRecommendation, ResumeSuggestion } from "@/types/jobs";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export interface TailoredResumeVersion {
  id: string;
  jobRef: string | null;
  roleTitle: string;
  companyName: string;
  tailoredResumeText: string | null;
  coverLetterText: string | null;
  submissionStatus: string;
  updatedAt: string;
}

export async function listTailoredResumeVersionsAction(): Promise<
  ActionResult<TailoredResumeVersion[]>
> {
  try {
    const { supabase, user } = await requireAuth();

    const { data, error } = await supabase
      .from("job_applications")
      .select(
        "id, job_id, external_job_id, role_title, tailored_resume_text, cover_letter_text, submission_status, last_activity_at, company_id"
      )
      .eq("user_id", user.id)
      .not("tailored_resume_text", "is", null)
      .order("last_activity_at", { ascending: false })
      .limit(30);

    if (error) throw error;

    const rows = (data ?? []) as Record<string, unknown>[];
    const companyIds = [
      ...new Set(rows.map((r) => r.company_id as string).filter(Boolean)),
    ];

    let companyMap = new Map<string, string>();
    if (companyIds.length > 0) {
      const { data: companies } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", companyIds);
      companyMap = new Map(
        (companies ?? []).map((c) => [c.id as string, c.name as string])
      );
    }

    const externalIds = rows
      .map((r) => r.external_job_id as string | null)
      .filter(Boolean) as string[];

    let externalMap = new Map<string, { external_key: string; company_name: string }>();
    if (externalIds.length > 0) {
      const { data: externals } = await supabase.from("external_jobs")
        .select("id, external_key, company_name")
        .in("id", externalIds);
      externalMap = new Map(
        (externals ?? []).map((e: Record<string, unknown>) => [
          e.id as string,
          {
            external_key: e.external_key as string,
            company_name: e.company_name as string,
          },
        ])
      );
    }

    return {
      success: true,
      data: rows.map((row) => {
        const external = row.external_job_id
          ? externalMap.get(row.external_job_id as string)
          : null;

        return {
          id: row.id as string,
          jobRef:
            (row.job_id as string | null) ??
            external?.external_key ??
            (row.external_job_id as string | null),
          roleTitle: (row.role_title as string) || "Vaga",
          companyName:
            companyMap.get(row.company_id as string) ??
            external?.company_name ??
            "",
          tailoredResumeText: row.tailored_resume_text as string | null,
          coverLetterText: row.cover_letter_text as string | null,
          submissionStatus: row.submission_status as string,
          updatedAt: row.last_activity_at as string,
        };
      }),
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function regenerateTailoredResumeAction(
  job: JobRecommendation
): Promise<
  ActionResult<{
    tailoredResumeText: string;
    coverLetterText: string;
    suggestions: ResumeSuggestion[];
  }>
> {
  try {
    const { supabase, user } = await requireAuth();
    const rate = checkRateLimit(user.id);
    if (!rate.allowed) {
      return { success: false, error: "Aguarde antes de regenerar novamente." };
    }

    const result = await prepareApplication(supabase, user.id, {
      jobRef: job.id,
      companyId: job.companyId || undefined,
      roleTitle: job.role,
      companyName: job.company,
      externalUrl: job.externalUrl,
      job,
    });

    const suggestions = await generateSuggestionsFromText(
      result.tailoredResumeText,
      job
    );

    return {
      success: true,
      data: {
        tailoredResumeText: result.tailoredResumeText ?? "",
        coverLetterText: result.coverLetterText ?? "",
        suggestions,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function generateResumeSuggestionsAction(
  job: Pick<JobRecommendation, "id" | "role" | "company" | "description" | "stack">
): Promise<ActionResult<ResumeSuggestion[]>> {
  try {
    const { supabase, user } = await requireAuth();
    const rate = checkRateLimit(user.id);
    if (!rate.allowed) {
      return { success: false, error: "Aguarde e tente novamente." };
    }

    const profile = await loadUserProfile(supabase, user.id);
    const suggestions = await generateSuggestionsWithGroq(profile, job);
    return { success: true, data: suggestions };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

async function generateSuggestionsFromText(
  resumeText: string | null,
  job: Pick<JobRecommendation, "role" | "company" | "description" | "stack">
): Promise<ResumeSuggestion[]> {
  if (!resumeText) {
    return generateSuggestionsWithGroq(null, job);
  }

  if (!isGroqConfigured()) {
    return [
      {
        id: "1",
        type: "highlight",
        text: `Destaque experiências alinhadas com ${job.role}.`,
      },
    ];
  }

  const raw = await chatCompletion(
    [
      {
        role: "system",
        content: `Analise currículo adaptado vs vaga. Retorne JSON:
{ "suggestions": [{ "type": "add"|"move"|"highlight", "text": string }] }
Máximo 4 sugestões. PT-BR.`,
      },
      {
        role: "user",
        content: JSON.stringify({ job, resumeText: resumeText.slice(0, 2000) }),
      },
    ],
    { jsonMode: true, temperature: 0.3 }
  );

  const parsed = JSON.parse(raw) as {
    suggestions?: { type: ResumeSuggestion["type"]; text: string }[];
  };

  return (parsed.suggestions ?? []).map((s, i) => ({
    id: String(i + 1),
    type: s.type,
    text: s.text,
  }));
}

async function generateSuggestionsWithGroq(
  profile: Awaited<ReturnType<typeof loadUserProfile>>,
  job: Pick<JobRecommendation, "role" | "company" | "description" | "stack">
): Promise<ResumeSuggestion[]> {
  if (!isGroqConfigured()) {
    return [
      {
        id: "1",
        type: "add",
        text: `Adicione keywords de ${(job.stack ?? []).slice(0, 3).join(", ") || job.role}.`,
      },
      {
        id: "2",
        type: "highlight",
        text: `Destaque resultados quantificáveis para ${job.company}.`,
      },
    ];
  }

  const raw = await chatCompletion(
    [
      {
        role: "system",
        content: `Sugira ajustes de currículo para uma vaga. Retorne JSON:
{ "suggestions": [{ "type": "add"|"move"|"highlight", "text": string }] }
Máximo 4 sugestões. PT-BR.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          profile: profile
            ? { skills: profile.skills.slice(0, 10), summary: profile.summary }
            : null,
          job,
        }),
      },
    ],
    { jsonMode: true, temperature: 0.4 }
  );

  const parsed = JSON.parse(raw) as {
    suggestions?: { type: ResumeSuggestion["type"]; text: string }[];
  };

  return (parsed.suggestions ?? []).map((s, i) => ({
    id: String(i + 1),
    type: s.type,
    text: s.text,
  }));
}
