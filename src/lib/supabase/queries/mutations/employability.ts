import type { SupabaseClient } from "@supabase/supabase-js";
import { createCrud } from "@/lib/supabase/crud/factory";

export interface DailyMissionRow {
  id: string;
  user_id: string;
  label: string;
  uplift_percent: number;
  is_completed: boolean;
  href: string;
  icon_name: string;
  mission_date: string;
  completed_at: string | null;
  created_at: string;
}

export interface EmployabilitySkillRow {
  id: string;
  user_id: string;
  label: string;
  score: number;
  uplift_percent: number;
  explanation: string;
  market_context: string | null;
  sort_order: number;
  updated_at: string;
}

export interface EmployabilityOverviewRow {
  user_id: string;
  score: number;
  goal_score: number;
  updated_at: string;
}

export interface CreateDailyMissionInput {
  label: string;
  uplift_percent?: number;
  href?: string;
  icon_name?: string;
  mission_date?: string;
}

export interface UpdateDailyMissionInput {
  label?: string;
  uplift_percent?: number;
  is_completed?: boolean;
  completed_at?: string | null;
  href?: string;
}

export interface CreateEmployabilitySkillInput {
  label: string;
  score?: number;
  uplift_percent?: number;
  explanation?: string;
  market_context?: string | null;
  sort_order?: number;
}

export interface UpdateEmployabilitySkillInput {
  label?: string;
  score?: number;
  uplift_percent?: number;
  explanation?: string;
  market_context?: string | null;
  sort_order?: number;
}

const missionCrud = createCrud<
  DailyMissionRow,
  CreateDailyMissionInput,
  UpdateDailyMissionInput
>("daily_missions", { orderColumn: "mission_date" });

const skillCrud = createCrud<
  EmployabilitySkillRow,
  CreateEmployabilitySkillInput,
  UpdateEmployabilitySkillInput
>("employability_skills", { orderColumn: "sort_order", ascending: true });

export const listDailyMissions = missionCrud.list;
export const createDailyMission = missionCrud.create;
export const updateDailyMission = missionCrud.update;
export const deleteDailyMission = missionCrud.remove;

export const listEmployabilitySkills = skillCrud.list;
export const createEmployabilitySkill = skillCrud.create;
export const updateEmployabilitySkill = skillCrud.update;
export const deleteEmployabilitySkill = skillCrud.remove;

export async function getEmployabilityOverview(
  supabase: SupabaseClient,
  userId: string
): Promise<EmployabilityOverviewRow | null> {
  const { data, error } = await supabase
    .from("employability_overviews")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as EmployabilityOverviewRow | null;
}

export async function upsertEmployabilityOverview(
  supabase: SupabaseClient,
  userId: string,
  input: { score?: number; goal_score?: number }
): Promise<EmployabilityOverviewRow> {
  const { data, error } = await supabase
    .from("employability_overviews")
    .upsert({ user_id: userId, ...input }, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw error;
  return data as EmployabilityOverviewRow;
}

export async function completeDailyMission(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<DailyMissionRow> {
  const mission = await updateDailyMission(supabase, userId, id, {
    is_completed: true,
    completed_at: new Date().toISOString(),
  });

  const overview = await getEmployabilityOverview(supabase, userId);
  const currentScore = overview?.score ?? 0;
  const boost = mission.uplift_percent;

  await upsertEmployabilityOverview(supabase, userId, {
    score: Math.min(100, currentScore + boost),
    goal_score: overview?.goal_score ?? 100,
  });

  return mission;
}
