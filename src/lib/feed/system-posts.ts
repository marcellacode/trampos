import type { SupabaseClient } from "@supabase/supabase-js";

export type SystemPostEventKind =
  | "onboarding_completed"
  | "certificate_added"
  | "internal_application_submitted";

const TEMPLATES: Record<SystemPostEventKind, (ctx: Record<string, string>) => string> = {
  onboarding_completed: () =>
    "Concluí meu onboarding na Jobera e estou pronto para novas oportunidades! 🚀",
  certificate_added: (ctx) =>
    `Adicionei uma nova certificação ao meu perfil: ${ctx.name ?? "Certificação"}.`,
  internal_application_submitted: (ctx) =>
    `Me candidatei à vaga ${ctx.roleTitle ?? "na plataforma"}${ctx.companyName ? ` na ${ctx.companyName}` : ""}.`,
};

export async function createSystemPostIfEnabled(
  supabase: SupabaseClient,
  userId: string,
  eventKind: SystemPostEventKind,
  context: Record<string, string> = {}
): Promise<string | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("auto_post_enabled")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile?.auto_post_enabled) return null;

  const template = TEMPLATES[eventKind];
  const content = template(context).trim();
  if (!content) return null;

  const { data: existing } = await supabase.from("posts")
    .select("id")
    .eq("author_user_id", userId)
    .eq("post_source", "system")
    .eq("source_event_kind", eventKind)
    .gte("created_at", new Date(Date.now() - 60_000).toISOString())
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase.from("posts")
    .insert({
      author_user_id: userId,
      content,
      visibility: "public",
      post_source: "system",
      source_event_kind: eventKind,
      media_urls: [],
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}
