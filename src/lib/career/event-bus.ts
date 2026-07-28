import type { SupabaseClient } from "@supabase/supabase-js";
import { createSystemPostIfEnabled } from "@/lib/feed/system-posts";
import { createNotification } from "@/lib/supabase/queries/mutations/notifications";
import { createTimelineEvent } from "@/lib/supabase/queries/mutations/timeline";

export type CareerEventKind =
  | "profile_updated"
  | "application_prepared"
  | "application_submitted"
  | "application_confirmed"
  | "follow_added"
  | "resume_tailored"
  | "certificate_added"
  | "interview_scheduled"
  | "onboarding_completed";

export interface CareerEventPayload {
  jobRef?: string | null;
  companyId?: string | null;
  companyName?: string;
  roleTitle?: string;
  applicationId?: string;
  tailoredResumeId?: string;
  applyUrl?: string | null;
  isExternal?: boolean;
  followTargetType?: "user" | "company";
  followTargetName?: string;
  certificateName?: string;
  interviewHref?: string;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

async function handleApplicationPrepared(
  supabase: SupabaseClient,
  userId: string,
  payload: CareerEventPayload
): Promise<void> {
  const roleTitle = payload.roleTitle ?? "Vaga";
  const companyName = payload.companyName ?? "Empresa";

  await createTimelineEvent(supabase, userId, {
    title: `Currículo adaptado: ${roleTitle}`,
    description: `Personalizado para ${companyName}.`,
    href: "/dashboard/curriculo",
    event_kind: "resume_tailored",
    actor: "ai",
    icon_name: "filetext",
    color_token: "purple",
    job_id: payload.isExternal ? null : payload.jobRef ?? null,
    company_id: payload.companyId ?? null,
  });

  await createTimelineEvent(supabase, userId, {
    title: `Candidatura preparada: ${roleTitle}`,
    description: payload.isExternal
      ? `Abra o site da empresa para concluir em ${companyName}.`
      : `Candidatura registrada para ${roleTitle}.`,
    href:
      payload.isExternal && payload.applyUrl
        ? payload.applyUrl
        : `/dashboard/vagas/${payload.jobRef ?? ""}`,
    event_kind: "application_sent",
    actor: "ai",
    icon_name: "send",
    color_token: "blue",
    job_id: payload.isExternal ? null : payload.jobRef ?? null,
    company_id: payload.companyId ?? null,
  });

  const followUpDate = addDays(new Date(), 7);
  await createTimelineEvent(supabase, userId, {
    title: `Follow-up sugerido: ${roleTitle}`,
    description: `Envie um acompanhamento para ${companyName} se ainda não tiver resposta.`,
    href: payload.jobRef ? `/dashboard/vagas/${payload.jobRef}` : "/dashboard/mensagens",
    event_kind: "application_sent",
    actor: "ai",
    icon_name: "clock",
    color_token: "amber",
    job_id: payload.isExternal ? null : payload.jobRef ?? null,
    company_id: payload.companyId ?? null,
    created_at: followUpDate.toISOString(),
  });
}

async function handleApplicationSubmitted(
  supabase: SupabaseClient,
  userId: string,
  payload: CareerEventPayload
): Promise<void> {
  const roleTitle = payload.roleTitle ?? "Vaga";
  const companyName = payload.companyName ?? "Empresa";
  const jobHref = payload.jobRef ? `/dashboard/vagas/${payload.jobRef}` : "/dashboard/vagas";

  await createTimelineEvent(supabase, userId, {
    title: `Candidatura enviada: ${roleTitle}`,
    description: `Sua candidatura para ${companyName} foi registrada na plataforma.`,
    href: jobHref,
    event_kind: "application_sent",
    actor: "user",
    icon_name: "send",
    color_token: "green",
    job_id: payload.jobRef ?? null,
    company_id: payload.companyId ?? null,
  });

  await createNotification(supabase, userId, {
    title: `Candidatura enviada — ${roleTitle}`,
    description: `${companyName} recebeu sua candidatura com currículo adaptado.`,
    href: jobHref,
    action_label: "Ver vaga",
    icon_name: "send",
    color_token: "green",
    notification_group: "today",
  });

  await createSystemPostIfEnabled(supabase, userId, "internal_application_submitted", {
    roleTitle,
    companyName,
  });

  const followUpDate = addDays(new Date(), 7);
  await createTimelineEvent(supabase, userId, {
    title: `Follow-up sugerido: ${roleTitle}`,
    description: `A IA sugere acompanhar sua candidatura em ${companyName}.`,
    href: "/dashboard/mensagens",
    event_kind: "application_sent",
    actor: "ai",
    icon_name: "clock",
    color_token: "amber",
    job_id: payload.jobRef ?? null,
    company_id: payload.companyId ?? null,
    created_at: followUpDate.toISOString(),
  });
}

async function handleFollowAdded(
  supabase: SupabaseClient,
  userId: string,
  payload: CareerEventPayload
): Promise<void> {
  const name = payload.followTargetName ?? "perfil";
  const isCompany = payload.followTargetType === "company";

  await createTimelineEvent(supabase, userId, {
    title: isCompany ? `Seguindo ${name}` : `Conectado com ${name}`,
    description: isCompany
      ? "Vagas e atualizações desta empresa aparecerão com prioridade."
      : "Publicações desta pessoa aparecerão no seu feed.",
    href: isCompany ? "/dashboard/vagas" : "/dashboard/feed",
    event_kind: "job_found",
    actor: "ai",
    icon_name: "users",
    color_token: "blue",
    company_id: isCompany ? payload.companyId ?? null : null,
  });
}

async function handleProfileUpdated(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await createTimelineEvent(supabase, userId, {
    title: "Perfil atualizado",
    description: "Seus matches de vaga serão recalculados com os novos dados.",
    href: "/dashboard/curriculo",
    event_kind: "compatibility",
    actor: "ai",
    icon_name: "sparkles",
    color_token: "green",
  });
}

async function handleCertificateAdded(
  supabase: SupabaseClient,
  userId: string,
  payload: CareerEventPayload
): Promise<void> {
  await createSystemPostIfEnabled(supabase, userId, "certificate_added", {
    name: payload.certificateName ?? "",
  });
}

async function handleOnboardingCompleted(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await createTimelineEvent(supabase, userId, {
    title: "Onboarding concluído",
    description: "Seu perfil está pronto. Explore vagas compatíveis.",
    href: "/dashboard/vagas",
    event_kind: "compatibility",
    actor: "ai",
    icon_name: "check",
    color_token: "green",
  });

  await createSystemPostIfEnabled(supabase, userId, "onboarding_completed", {});
}

async function handleInterviewScheduled(
  supabase: SupabaseClient,
  userId: string,
  payload: CareerEventPayload
): Promise<void> {
  await createTimelineEvent(supabase, userId, {
    title: `Entrevista: ${payload.roleTitle ?? "processo seletivo"}`,
    description: payload.companyName
      ? `Prepare-se para conversar com ${payload.companyName}.`
      : "Use o simulador de entrevistas para praticar.",
    href: payload.interviewHref ?? "/dashboard/entrevistas",
    event_kind: "interview_invite",
    actor: "company",
    icon_name: "video",
    color_token: "pink",
    job_id: payload.jobRef ?? null,
    company_id: payload.companyId ?? null,
  });

  await createNotification(supabase, userId, {
    title: "Entrevista agendada",
    description: `Prepare-se para ${payload.roleTitle ?? "sua entrevista"}.`,
    href: payload.interviewHref ?? "/dashboard/entrevistas",
    action_label: "Preparar com IA",
    icon_name: "video",
    color_token: "pink",
    notification_group: "today",
  });
}

type EventHandler = (
  supabase: SupabaseClient,
  userId: string,
  payload: CareerEventPayload
) => Promise<void>;

const EVENT_HANDLERS: Partial<Record<CareerEventKind, EventHandler>> = {
  application_prepared: handleApplicationPrepared,
  application_submitted: handleApplicationSubmitted,
  follow_added: handleFollowAdded,
  profile_updated: (supabase, userId) => handleProfileUpdated(supabase, userId),
  certificate_added: handleCertificateAdded,
  onboarding_completed: (supabase, userId) =>
    handleOnboardingCompleted(supabase, userId),
  interview_scheduled: handleInterviewScheduled,
};

export async function emitCareerEvent(
  supabase: SupabaseClient,
  userId: string,
  kind: CareerEventKind,
  payload: CareerEventPayload = {}
): Promise<void> {
  const handler = EVENT_HANDLERS[kind];
  if (!handler) return;

  try {
    await handler(supabase, userId, payload);
  } catch (error) {
    console.error(`[emitCareerEvent] ${kind} failed:`, error);
  }
}
