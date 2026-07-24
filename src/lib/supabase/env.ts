const DEFAULT_PROJECT_URL = "https://kccbfeqzhxygndrfvzwd.supabase.co";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getSupabaseEnv() {
  const url = trimTrailingSlash(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_PROJECT_URL
  );
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada. Copie .env.example para .env.local."
    );
  }

  return {
    url,
    anonKey,
    restUrl: `${url}/rest/v1`,
    projectRef: "kccbfeqzhxygndrfvzwd",
  } as const;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Server-only. Bypasses RLS — never import from client components. */
export function getSupabaseServiceEnv() {
  if (typeof window !== "undefined") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY só pode ser usada no servidor."
    );
  }

  const base = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione ao .env.local (sem NEXT_PUBLIC_)."
    );
  }

  return {
    ...base,
    serviceRoleKey,
  } as const;
}

export function isSupabaseServiceConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
