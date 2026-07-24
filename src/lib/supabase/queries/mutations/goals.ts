import type { SupabaseClient } from "@supabase/supabase-js";
import { createCrud } from "@/lib/supabase/crud/factory";

export interface GoalChipRow {
  id: string;
  user_id: string;
  label: string;
  category: string;
  sort_order: number;
  created_at: string;
}

export interface SmartFilterRow {
  id: string;
  user_id: string;
  label: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface CreateGoalChipInput {
  label: string;
  category: string;
  sort_order?: number;
}

export interface UpdateGoalChipInput {
  label?: string;
  category?: string;
  sort_order?: number;
}

export interface CreateSmartFilterInput {
  label: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateSmartFilterInput {
  label?: string;
  is_active?: boolean;
  sort_order?: number;
}

const goalCrud = createCrud<
  GoalChipRow,
  CreateGoalChipInput,
  UpdateGoalChipInput
>("goal_chips", { orderColumn: "sort_order", ascending: true });

const filterCrud = createCrud<
  SmartFilterRow,
  CreateSmartFilterInput,
  UpdateSmartFilterInput
>("smart_filters", { orderColumn: "sort_order", ascending: true });

export const listGoalChips = goalCrud.list;
export const createGoalChip = goalCrud.create;
export const updateGoalChip = goalCrud.update;
export const deleteGoalChip = goalCrud.remove;

export const listSmartFilters = filterCrud.list;
export const createSmartFilter = filterCrud.create;
export const updateSmartFilter = filterCrud.update;
export const deleteSmartFilter = filterCrud.remove;

export async function updateProfileGoals(
  supabase: SupabaseClient,
  userId: string,
  input: {
    goal_text?: string;
    goal_role?: string;
    goal_location?: string;
    goal_salary?: string;
    goal_availability_label?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userId);

  if (error) throw error;
}
