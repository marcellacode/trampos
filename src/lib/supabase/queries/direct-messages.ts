import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/supabase/queries/mutations/notifications";
import { fetchEditableCompany } from "@/lib/supabase/queries/company";

interface DbDirectMessageRow {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface ConversationSummary {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyColor: string;
  otherUserId: string;
  otherUserName: string;
  otherUserInitials: string;
  otherUserRole: "candidate" | "recruiter";
  jobApplicationId: string | null;
  jobTitle: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface DirectMessageRow {
  id: string;
  conversationId: string;
  senderUserId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  isMine: boolean;
}

async function getParticipantProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{ fullName: string; initials: string }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, first_name, avatar_initials, initials")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return {
    fullName: data?.full_name || data?.first_name || "Usuário",
    initials: data?.avatar_initials || data?.initials || "?",
  };
}

export async function startConversationFromApplication(
  supabase: SupabaseClient,
  recruiterId: string,
  applicationId: string
): Promise<string> {
  const { data: application, error: appError } = await supabase
    .from("job_applications")
    .select("id, user_id, company_id, role_title, application_source")
    .eq("id", applicationId)
    .maybeSingle();

  if (appError) throw appError;
  if (!application) throw new Error("Candidatura não encontrada.");
  if (application.application_source !== "internal") {
    throw new Error("Mensagens disponíveis apenas para candidaturas internas.");
  }

  const editable = await fetchEditableCompany(
    supabase,
    recruiterId,
    application.company_id
  );
  if (!editable) {
    throw new Error("Sem permissão para contatar este candidato.");
  }

  const { data: existingConv } = await supabase.from("conversations")
    .select("id")
    .eq("job_application_id", applicationId)
    .maybeSingle();

  if (existingConv?.id) return existingConv.id as string;

  const now = new Date().toISOString();
  const { data: conversation, error: convError } = await supabase.from("conversations")
    .insert({
      job_application_id: applicationId,
      company_id: application.company_id,
      last_message_at: now,
    })
    .select("id")
    .single();

  if (convError) throw convError;

  const conversationId = conversation.id as string;

  const { error: participantsError } = await supabase.from("conversation_participants").insert([
    {
      conversation_id: conversationId,
      user_id: application.user_id,
      role: "candidate",
    },
    {
      conversation_id: conversationId,
      user_id: recruiterId,
      role: "recruiter",
    },
  ]);

  if (participantsError) throw participantsError;
  return conversationId;
}

export async function sendDirectMessage(
  supabase: SupabaseClient,
  senderId: string,
  conversationId: string,
  content: string
): Promise<DirectMessageRow> {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Mensagem vazia.");

  const now = new Date().toISOString();

  const { data, error } = await supabase.from("direct_messages")
    .insert({
      conversation_id: conversationId,
      sender_user_id: senderId,
      content: trimmed,
    })
    .select("id, conversation_id, sender_user_id, content, created_at, read_at")
    .single();

  if (error) throw error;

  await supabase.from("conversations")
    .update({ last_message_at: now })
    .eq("id", conversationId);

  const { data: participants, error: partError } = await supabase.from("conversation_participants")
    .select("user_id")
    .eq("conversation_id", conversationId)
    .neq("user_id", senderId);

  if (partError) throw partError;

  const senderProfile = await getParticipantProfile(supabase, senderId);

  for (const participant of participants ?? []) {
    await createNotification(supabase, participant.user_id as string, {
      title: `Nova mensagem de ${senderProfile.fullName}`,
      description: trimmed.slice(0, 120),
      href: "/dashboard/mensagens?tab=pessoas",
      action_label: "Responder",
      icon_name: "message-square",
      color_token: "blue",
      notification_group: "today",
    });
  }

  return {
    id: data.id as string,
    conversationId: data.conversation_id as string,
    senderUserId: data.sender_user_id as string,
    content: data.content as string,
    createdAt: data.created_at as string,
    readAt: data.read_at as string | null,
    isMine: true,
  };
}

export async function listConversations(
  supabase: SupabaseClient,
  userId: string
): Promise<ConversationSummary[]> {
  const { data: memberships, error: memberError } = await supabase.from("conversation_participants")
    .select("conversation_id, role")
    .eq("user_id", userId);

  if (memberError) throw memberError;
  if (!memberships?.length) return [];

  const conversationIds = (memberships ?? []).map(
    (m: { conversation_id: string }) => m.conversation_id
  );

  const { data: conversations, error: convError } = await supabase.from("conversations")
    .select(
      `
      id,
      company_id,
      job_application_id,
      last_message_at,
      companies (name, logo, brand_color),
      job_applications (role_title)
    `
    )
    .in("id", conversationIds)
    .order("last_message_at", { ascending: false });

  if (convError) throw convError;

  const summaries: ConversationSummary[] = [];

  for (const conv of conversations ?? []) {
    const company = Array.isArray(conv.companies) ? conv.companies[0] : conv.companies;
    const application = Array.isArray(conv.job_applications)
      ? conv.job_applications[0]
      : conv.job_applications;

    const { data: participants, error: partError } = await supabase.from("conversation_participants")
      .select("user_id, role")
      .eq("conversation_id", conv.id)
      .neq("user_id", userId);

    if (partError) throw partError;

    const other = participants?.[0];
    if (!other) continue;

    const otherProfile = await getParticipantProfile(supabase, other.user_id as string);

    const { data: lastMsg } = await supabase.from("direct_messages")
      .select("content, created_at, sender_user_id, read_at")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: unreadCount } = await supabase.from("direct_messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", conv.id)
      .neq("sender_user_id", userId)
      .is("read_at", null);

    summaries.push({
      id: conv.id as string,
      companyId: conv.company_id as string,
      companyName: (company?.name as string) ?? "Empresa",
      companyLogo: (company?.logo as string) ?? "?",
      companyColor: (company?.brand_color as string) ?? "#4F7CFF",
      otherUserId: other.user_id as string,
      otherUserName: otherProfile.fullName,
      otherUserInitials: otherProfile.initials,
      otherUserRole: other.role as "candidate" | "recruiter",
      jobApplicationId: conv.job_application_id as string | null,
      jobTitle: (application?.role_title as string) ?? null,
      lastMessagePreview: (lastMsg?.content as string) ?? null,
      lastMessageAt: (lastMsg?.created_at as string) ?? (conv.last_message_at as string),
      unreadCount: unreadCount ?? 0,
    });
  }

  summaries.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  return summaries;
}

export async function listMessages(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string
): Promise<DirectMessageRow[]> {
  const { data: membership, error: memberError } = await supabase.from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError) throw memberError;
  if (!membership) throw new Error("Conversa não encontrada.");

  const { data, error } = await supabase.from("direct_messages")
    .select("id, conversation_id, sender_user_id, content, created_at, read_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return ((data ?? []) as DbDirectMessageRow[]).map((row) => ({
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderUserId: row.sender_user_id as string,
    content: row.content as string,
    createdAt: row.created_at as string,
    readAt: row.read_at as string | null,
    isMine: row.sender_user_id === userId,
  }));
}

export async function markConversationRead(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase.from("direct_messages")
    .update({ read_at: now })
    .eq("conversation_id", conversationId)
    .neq("sender_user_id", userId)
    .is("read_at", null);

  if (error) throw error;
}

export async function countUnreadDirectMessages(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await supabase.rpc("count_unread_direct_messages", {
    target_user_id: userId,
  });

  if (error) {
    const { count } = await supabase.from("direct_messages")
      .select("id", { count: "exact", head: true });

    void count;
    return 0;
  }

  return Number(data ?? 0);
}
