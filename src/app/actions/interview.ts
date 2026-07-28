"use server";

import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { chatCompletion } from "@/lib/ai/groq";
import { isGroqConfigured } from "@/lib/ai/env";
import { loadUserProfile } from "@/lib/matching/compute-compatibility";
import { isInternalJobRef } from "@/lib/external-jobs/resolve-job-ref";
import { getExternalJobByKey } from "@/lib/external-jobs/upsert-external-job";
import type { ActionResult } from "@/app/actions/ai";
import type { Json } from "@/lib/supabase/database.types";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export interface InterviewMessage {
  role: "interviewer" | "user" | "feedback";
  content: string;
  timestamp: string;
}

interface JobInterviewContext {
  roleTitle: string;
  companyName: string;
  jobId: string | null;
  externalJobId: string | null;
  stack: string[];
  description: string;
}

async function resolveJobInterviewContext(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  jobId?: string,
  fallback?: { roleTitle?: string; companyName?: string }
): Promise<JobInterviewContext | null> {
  if (!jobId) return null;

  if (isInternalJobRef(jobId)) {
    const { data } = await supabase
      .from("jobs")
      .select("id, title, ai_summary, company_id")
      .eq("id", jobId)
      .maybeSingle();

    if (!data) return null;

    let companyName = fallback?.companyName ?? "Empresa";
    if (data.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", data.company_id)
        .maybeSingle();
      companyName = company?.name ?? companyName;
    }

    return {
      roleTitle: data.title,
      companyName,
      jobId: data.id,
      externalJobId: null,
      stack: [],
      description: data.ai_summary ?? "",
    };
  }

  const external = await getExternalJobByKey(supabase, jobId);
  if (external) {
    return {
      roleTitle: external.title,
      companyName: external.company_name || fallback?.companyName || "Empresa",
      jobId: null,
      externalJobId: external.id,
      stack: Array.isArray(external.stack) ? (external.stack as string[]) : [],
      description: external.description ?? "",
    };
  }

  return {
    roleTitle: fallback?.roleTitle ?? "Desenvolvedor",
    companyName: fallback?.companyName ?? "Empresa",
    jobId: null,
    externalJobId: null,
    stack: [],
    description: "",
  };
}

export async function startInterviewSessionAction(input?: {
  jobId?: string;
  roleTitle?: string;
  companyName?: string;
}): Promise<
  ActionResult<{ sessionId: string; question: string; messages: InterviewMessage[] }>
> {
  try {
    const { supabase, user } = await requireAuth();
    const rate = checkRateLimit(user.id);
    if (!rate.allowed) {
      return { success: false, error: "Aguarde antes de iniciar outra entrevista." };
    }

    const profile = await loadUserProfile(supabase, user.id);
    const jobContext = await resolveJobInterviewContext(supabase, input?.jobId, {
      roleTitle: input?.roleTitle,
      companyName: input?.companyName,
    });

    const roleTitle =
      jobContext?.roleTitle ?? input?.roleTitle ?? profile?.currentRole ?? "Desenvolvedor";
    const companyName = jobContext?.companyName ?? input?.companyName ?? "Empresa";

    let question =
      "Conte-me sobre você e por que se interessa por esta vaga.";

    if (isGroqConfigured()) {
      const raw = await chatCompletion(
        [
          {
            role: "system",
            content: `Gere a primeira pergunta de entrevista simulada em PT-BR para a vaga específica.
Retorne JSON: { "question": string }`,
          },
          {
            role: "user",
            content: JSON.stringify({
              role: roleTitle,
              company: companyName,
              description: jobContext?.description?.slice(0, 600),
              stack: jobContext?.stack?.slice(0, 8),
              profile: profile
                ? { skills: profile.skills.slice(0, 8), summary: profile.summary }
                : null,
            }),
          },
        ],
        { jsonMode: true, temperature: 0.5 }
      );
      const parsed = JSON.parse(raw) as { question: string };
      question = parsed.question || question;
    }

    const now = new Date().toISOString();
    const messages: InterviewMessage[] = [
      { role: "interviewer", content: question, timestamp: now },
    ];

    const { data, error } = await supabase.from("interview_sessions")
      .insert({
        user_id: user.id,
        job_id: jobContext?.jobId ?? null,
        external_job_id: jobContext?.externalJobId ?? null,
        role_title: roleTitle,
        company_name: companyName,
        status: "active",
        questions: [{ question }] as Json,
        messages: messages as unknown as Json,
      })
      .select("id")
      .single();

    if (error) throw error;

    return {
      success: true,
      data: { sessionId: data.id as string, question, messages },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function submitInterviewAnswerAction(
  sessionId: string,
  answer: string
): Promise<
  ActionResult<{
    messages: InterviewMessage[];
    done: boolean;
    score?: number;
    feedbackSummary?: string;
  }>
> {
  try {
    const trimmed = answer.trim();
    if (!trimmed) return { success: false, error: "Digite sua resposta." };

    const { supabase, user } = await requireAuth();
    const rate = checkRateLimit(user.id);
    if (!rate.allowed) {
      return { success: false, error: "Aguarde e tente novamente." };
    }

    const { data: session, error: fetchError } = await supabase.from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !session) {
      return { success: false, error: "Sessão não encontrada." };
    }

    const messages = (session.messages ?? []) as unknown as InterviewMessage[];
    const now = new Date().toISOString();
    messages.push({ role: "user", content: trimmed, timestamp: now });

    const turnCount = messages.filter((m) => m.role === "user").length;
    const done = turnCount >= 3;

    let feedback = "Boa resposta. Continue praticando com exemplos concretos.";
    let nextQuestion = "";
    let score = 70;
    let feedbackSummary = "";

    if (isGroqConfigured()) {
      const raw = await chatCompletion(
        [
          {
            role: "system",
            content: done
              ? `Avalie a entrevista simulada. Retorne JSON:
{ "score": 0-100, "feedbackSummary": string, "feedback": string }`
              : `Dê feedback breve e próxima pergunta. Retorne JSON:
{ "feedback": string, "nextQuestion": string, "score": 0-100 }`,
          },
          {
            role: "user",
            content: JSON.stringify({
              role: session.role_title,
              company: session.company_name,
              messages,
            }),
          },
        ],
        { jsonMode: true, temperature: 0.4 }
      );

      const parsed = JSON.parse(raw) as {
        feedback?: string;
        nextQuestion?: string;
        score?: number;
        feedbackSummary?: string;
      };

      feedback = parsed.feedback ?? feedback;
      nextQuestion = parsed.nextQuestion ?? "";
      score = parsed.score ?? score;
      feedbackSummary = parsed.feedbackSummary ?? "";
    }

    messages.push({ role: "feedback", content: feedback, timestamp: now });

    if (!done && nextQuestion) {
      messages.push({ role: "interviewer", content: nextQuestion, timestamp: now });
    }

    if (done) {
      await supabase.from("interview_sessions")
        .update({
          messages: messages as unknown as Json,
          status: "completed",
          score,
          feedback_summary: feedbackSummary || feedback,
        })
        .eq("id", sessionId);
    } else {
      await supabase.from("interview_sessions")
        .update({ messages: messages as unknown as Json, status: "active" })
        .eq("id", sessionId);
    }

    return {
      success: true,
      data: { messages, done, score: done ? score : undefined, feedbackSummary },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function endInterviewSessionAction(
  sessionId: string
): Promise<
  ActionResult<{
    score: number;
    feedbackSummary: string;
    messages: InterviewMessage[];
  }>
> {
  try {
    const { supabase, user } = await requireAuth();
    const rate = checkRateLimit(user.id);
    if (!rate.allowed) {
      return { success: false, error: "Aguarde e tente novamente." };
    }

    const { data: session, error: fetchError } = await supabase.from("interview_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !session) {
      return { success: false, error: "Sessão não encontrada." };
    }

    const messages = (session.messages ?? []) as unknown as InterviewMessage[];

    if (session.status === "completed" && session.score != null) {
      return {
        success: true,
        data: {
          score: session.score as number,
          feedbackSummary: (session.feedback_summary as string) || "",
          messages,
        },
      };
    }

    let score = 70;
    let feedbackSummary =
      "Boa prática geral. Continue treinando respostas com exemplos STAR.";

    if (isGroqConfigured()) {
      const raw = await chatCompletion(
        [
          {
            role: "system",
            content: `Encerre a entrevista simulada com resumo final. Retorne JSON:
{ "score": 0-100, "feedbackSummary": string }`,
          },
          {
            role: "user",
            content: JSON.stringify({
              role: session.role_title,
              company: session.company_name,
              messages,
            }),
          },
        ],
        { jsonMode: true, temperature: 0.3 }
      );

      const parsed = JSON.parse(raw) as { score?: number; feedbackSummary?: string };
      score = parsed.score ?? score;
      feedbackSummary = parsed.feedbackSummary ?? feedbackSummary;
    }

    const now = new Date().toISOString();
    messages.push({
      role: "feedback",
      content: feedbackSummary,
      timestamp: now,
    });

    await supabase.from("interview_sessions")
      .update({
        messages: messages as unknown as Json,
        status: "completed",
        score,
        feedback_summary: feedbackSummary,
      })
      .eq("id", sessionId);

    return {
      success: true,
      data: { score, feedbackSummary, messages },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function listInterviewSessionsAction(): Promise<
  ActionResult<
    {
      id: string;
      roleTitle: string;
      companyName: string;
      status: string;
      score: number | null;
      createdAt: string;
    }[]
  >
> {
  try {
    const { supabase, user } = await requireAuth();
    const { data, error } = await supabase.from("interview_sessions")
      .select("id, role_title, company_name, status, score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return {
      success: true,
      data: (data ?? []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        roleTitle: row.role_title as string,
        companyName: row.company_name as string,
        status: row.status as string,
        score: row.score as number | null,
        createdAt: row.created_at as string,
      })),
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
