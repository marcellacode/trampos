import { createServerSupabaseClient } from "@/lib/supabase/server";

export class AuthError extends Error {
  constructor(message = "Faça login para continuar.") {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError();
  }

  return { supabase, user };
}

export async function getOptionalAuth() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}
