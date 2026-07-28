import type { SupabaseClient } from "@supabase/supabase-js";
import { createCrud } from "@/lib/supabase/crud/factory";

export interface TimelineEventRow {
  id: string;
  user_id: string;
  job_id: string | null;
  company_id: string | null;
  title: string;
  description: string | null;
  href: string;
  actor: string;
  event_kind: string;
  icon_name: string;
  color_token: string;
  glow_token: string;
  is_live: boolean;
  created_at: string;
}

export interface CreateTimelineEventInput {
  job_id?: string | null;
  company_id?: string | null;
  title: string;
  description?: string;
  href?: string;
  actor?: string;
  event_kind: string;
  icon_name?: string;
  color_token?: string;
  glow_token?: string;
  is_live?: boolean;
  created_at?: string;
}

export interface UpdateTimelineEventInput {
  title?: string;
  description?: string;
  href?: string;
  event_kind?: string;
  is_live?: boolean;
}

const crud = createCrud<
  TimelineEventRow,
  CreateTimelineEventInput,
  UpdateTimelineEventInput
>("timeline_events");

export const listTimelineEvents = crud.list;
export const getTimelineEvent = crud.get;
export const createTimelineEvent = crud.create;
export const updateTimelineEvent = crud.update;
export const deleteTimelineEvent = crud.remove;

export async function listTimelineEventsByKind(
  supabase: SupabaseClient,
  userId: string,
  eventKind: string
): Promise<TimelineEventRow[]> {
  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("user_id", userId)
    .eq("event_kind", eventKind)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as TimelineEventRow[];
}
