import type { SupabaseClient } from "@supabase/supabase-js";

export interface CrudOptions {
  userIdColumn?: string;
  orderColumn?: string;
  ascending?: boolean;
}

export function createCrud<
  T extends object,
  CreateInput extends object,
  UpdateInput extends object,
>(table: string, options: CrudOptions = {}) {
  const userIdColumn = options.userIdColumn ?? "user_id";
  const orderColumn = options.orderColumn ?? "created_at";
  const ascending = options.ascending ?? false;

  return {
    async list(supabase: SupabaseClient, userId: string): Promise<T[]> {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(userIdColumn, userId)
        .order(orderColumn, { ascending });

      if (error) throw error;
      return (data ?? []) as T[];
    },

    async get(
      supabase: SupabaseClient,
      userId: string,
      id: string
    ): Promise<T | null> {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(userIdColumn, userId)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as T | null;
    },

    async create(
      supabase: SupabaseClient,
      userId: string,
      input: CreateInput
    ): Promise<T> {
      const { data, error } = await supabase
        .from(table)
        .insert({ ...input, [userIdColumn]: userId } as Record<string, unknown>)
        .select("*")
        .single();

      if (error) throw error;
      return data as T;
    },

    async update(
      supabase: SupabaseClient,
      userId: string,
      id: string,
      input: UpdateInput
    ): Promise<T> {
      const { data, error } = await supabase
        .from(table)
        .update(input as Record<string, unknown>)
        .eq(userIdColumn, userId)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return data as T;
    },

    async remove(
      supabase: SupabaseClient,
      userId: string,
      id: string
    ): Promise<void> {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(userIdColumn, userId)
        .eq("id", id);

      if (error) throw error;
    },
  };
}
