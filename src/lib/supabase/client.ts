import { createBrowserClient } from "@supabase/ssr";

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function getAuthCallbackUrl(next = "/onboarding") {
  if (typeof window === "undefined") return `/auth/callback?next=${next}`;
  return `${window.location.origin}/auth/callback?next=${next}`;
}
