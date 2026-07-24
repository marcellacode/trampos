import type {
  AuthProvider,
  OAuthSignInOptions,
  SignInWithPasswordOptions,
} from "@/types/auth";
import {
  createBrowserSupabaseClient,
  getAuthCallbackUrl,
} from "@/lib/supabase/client";

export function mapProvider(
  provider: AuthProvider
): "google" | "github" | "linkedin_oidc" {
  if (provider === "linkedin") return "linkedin_oidc";
  return provider;
}

export async function signInWithPassword({
  email,
  password,
}: SignInWithPasswordOptions): Promise<{ error: string | null }> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signInWithOAuth({
  provider,
  redirectTo = "/onboarding",
}: OAuthSignInOptions): Promise<{ error: string | null }> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: mapProvider(provider),
    options: {
      redirectTo: getAuthCallbackUrl(redirectTo),
    },
  });
  return { error: error?.message ?? null };
}
