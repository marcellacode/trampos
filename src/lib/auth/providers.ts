import type {
  AuthProvider,
  OAuthSignInOptions,
  ResetPasswordForEmailOptions,
  SignInWithPasswordOptions,
  SignUpWithPasswordOptions,
  UpdatePasswordOptions,
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

export async function signUpWithPassword({
  fullName,
  email,
  password,
}: SignUpWithPasswordOptions): Promise<{
  error: string | null;
  confirmationRequired: boolean;
}> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: getAuthCallbackUrl("/onboarding"),
    },
  });

  return {
    error: error?.message ?? null,
    confirmationRequired: !error && !data.session,
  };
}

export async function signInWithOAuth({
  provider,
  redirectTo = "/onboarding",
}: OAuthSignInOptions): Promise<{ error: string | null }> {
  const supabase = createBrowserSupabaseClient();
  const mappedProvider = mapProvider(provider);

  const scopes =
    provider === "google"
      ? "openid email profile"
      : provider === "github"
        ? "read:user user:email"
        : "openid profile email";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: mappedProvider,
    options: {
      redirectTo: getAuthCallbackUrl(redirectTo),
      scopes,
      skipBrowserRedirect: true,
    },
  });

  if (error) return { error: error.message };

  if (!data.url) {
    return { error: "Não foi possível iniciar a autenticação social." };
  }

  window.location.assign(data.url);
  return { error: null };
}

export async function resetPasswordForEmail({
  email,
  redirectTo = "/reset-password",
}: ResetPasswordForEmailOptions): Promise<{ error: string | null }> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthCallbackUrl(redirectTo),
  });
  return { error: error?.message ?? null };
}

export async function updatePassword({
  password,
}: UpdatePasswordOptions): Promise<{ error: string | null }> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error?.message ?? null };
}
