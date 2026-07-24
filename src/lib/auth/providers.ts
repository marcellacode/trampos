import type {
  AuthProvider,
  OAuthSignInOptions,
  SignInWithPasswordOptions,
} from "@/types/auth";

/**
 * Auth client stubs prepared for Supabase Auth.
 * Replace the body of each method with supabase.auth.* calls.
 */

export async function signInWithPassword({
  email,
  password,
}: SignInWithPasswordOptions): Promise<{ error: string | null }> {
  await delay(1600);
  void email;
  void password;
  return { error: null };
}

export async function signInWithOAuth({
  provider,
  redirectTo = "/onboarding",
}: OAuthSignInOptions): Promise<{ error: string | null }> {
  await delay(900);
  console.info(`[auth] OAuth ready for ${provider} → ${redirectTo}`);
  return { error: null };
}

export function mapProvider(
  provider: AuthProvider
): "google" | "github" | "linkedin_oidc" {
  if (provider === "linkedin") return "linkedin_oidc";
  return provider;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
