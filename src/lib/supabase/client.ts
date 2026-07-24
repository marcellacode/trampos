import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createBrowserClient<Database>(url, anonKey);
}

export function getAuthCallbackUrl(next = "/onboarding") {
  if (typeof window === "undefined") return `/auth/callback?next=${next}`;
  return `${window.location.origin}/auth/callback?next=${next}`;
}

export type TypedSupabaseClient = ReturnType<typeof createBrowserSupabaseClient>;
