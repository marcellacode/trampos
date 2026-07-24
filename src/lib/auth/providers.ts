import type {
  AuthProvider,
  OAuthSignInOptions,
  SignInWithPasswordOptions,
} from "@/types/auth";

/**
 * Auth client stubs prepared for Supabase Auth.
 * Replace the body of each method with supabase.auth.* calls.
 *
 * Expected env vars:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

const DEMO_WRONG_PASSWORD_EMAIL = "erro@tramply.ai";

export async function signInWithPassword({
  email,
  password,
}: SignInWithPasswordOptions): Promise<{ error: string | null }> {
  // Simulate network latency — swap for:
  // const { error } = await supabase.auth.signInWithPassword({ email, password })
  await delay(1600);

  if (email.toLowerCase() === DEMO_WRONG_PASSWORD_EMAIL) {
    return {
      error:
        "Senha incorreta. Verifique e tente novamente, ou redefina sua senha.",
    };
  }

  if (password === "errada") {
    return {
      error:
        "Senha incorreta. Verifique e tente novamente, ou redefina sua senha.",
    };
  }

  void password;
  return { error: null };
}

export async function signInWithOAuth({
  provider,
  redirectTo = "/onboarding",
}: OAuthSignInOptions): Promise<{ error: string | null }> {
  // Swap for:
  // const { error } = await supabase.auth.signInWithOAuth({
  //   provider: mapProvider(provider),
  //   options: { redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}` },
  // })
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
