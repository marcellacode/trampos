/**
 * Supabase client stub — wire when backend is ready.
 *
 * 1. npm install @supabase/supabase-js @supabase/ssr
 * 2. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 3. Replace createBrowserClient / createServerClient implementations
 */

export function createBrowserSupabaseClient() {
  // import { createBrowserClient } from '@supabase/ssr'
  // return createBrowserClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // )
  throw new Error(
    "Supabase ainda não configurado. Defina as env vars e descomente o client."
  );
}

export function getAuthCallbackUrl(next = "/onboarding") {
  if (typeof window === "undefined") return `/auth/callback?next=${next}`;
  return `${window.location.origin}/auth/callback?next=${next}`;
}
