"use server";

import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import { fromExtendedTable } from "@/lib/supabase/extended-client";
import { checkRateLimit } from "@/lib/ai/rate-limit";
import { chatCompletion } from "@/lib/ai/groq";
import { isGroqConfigured } from "@/lib/ai/env";
import { loadUserProfile } from "@/lib/matching/compute-compatibility";
import type { ActionResult } from "@/app/actions/ai";

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
    const roleTitle = input?.roleTitle ?? profile?.currentRole ?? "Desenvolvedor";
    const companyName = input?.companyName ?? "Empresa";

    let question =
      "Conte-me sobre você e por que se interessa por esta vaga.";

    if (isGroqConfigured()) {
      const raw = await chatCompletion(
        [
          {
            role: "system",
            content: `Gere a primeira pergunta de entrevista simulada em PT-BR.
Retorne JSON: { "question": string }`,
          },
          {
            role: "user",
            content: JSON.stringify({
              role: roleTitle,
              company: companyName,
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

    const { data, error } = await fromExtendedTable(supabase, "interview_sessions")
      .insert({
        user_id: user.id,
        job_id: input?.jobId?.match(/^[0-9a-f-]{36}$/i) ? input.jobId : null,
        role_title: roleTitle,
        company_name: companyName,
        status: "active",
        questions: [{ question }],
        messages,
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

    const { data: session, error: fetchError } = await fromExtendedTable(
      supabase,
      "interview_sessions"
    )
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !session) {
      return { success: false, error: "Sessão não encontrada." };
    }

    const messages = (session.messages ?? []) as InterviewMessage[];
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

    await fromExtendedTable(supabase, "interview_sessions")
      .update({
        messages,
        status: done ? "completed" : "active",
        score: done ? score : session.score,
        feedback_summary: done ? feedbackSummary || feedback : session.feedback_summary,
      })
      .eq("id", sessionId);

    return {
      success: true,
      data: { messages, done, score: done ? score : undefined, feedbackSummary },
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
    const { data, error } = await fromExtendedTable(supabase, "interview_sessions")
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
