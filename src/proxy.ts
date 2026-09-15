import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DASHBOARD_HOME } from "@/lib/auth/redirect";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnv } from "@/lib/supabase/env";

const PROTECTED_PREFIXES = ["/dashboard", "/onboarding"];
const AUTH_ROUTES = ["/login", "/cadastro"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone(); loginUrl.pathname = "/login"; loginUrl.search = ""; loginUrl.searchParams.set("next", request.nextUrl.pathname); return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPath = isProtectedPath(pathname);
  const authRoute = isAuthRoute(pathname);
  if (!protectedPath && !authRoute) return NextResponse.next();

  let supabaseResponse = NextResponse.next({ request });
  try {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createServerClient<Database>(url, anonKey, { cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value)); supabaseResponse = NextResponse.next({ request }); cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options)); },
    }});
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return protectedPath ? redirectToLogin(request) : supabaseResponse;

    const { data: profile } = await supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle();
    if (authRoute) {
      const redirectUrl = request.nextUrl.clone(); redirectUrl.pathname = profile?.onboarding_completed ? DASHBOARD_HOME : "/onboarding"; redirectUrl.search = ""; return NextResponse.redirect(redirectUrl);
    }
    if (pathname.startsWith("/dashboard") && !profile?.onboarding_completed) {
      const onboardingUrl = request.nextUrl.clone(); onboardingUrl.pathname = "/onboarding"; onboardingUrl.search = ""; return NextResponse.redirect(onboardingUrl);
    }

    // Next.js Server Actions are POST requests to the current route. During the
    // final onboarding action the profile is marked complete before the action
    // response returns. Redirecting that POST here replaces the Server Action
    // response with a 307 and leaves the client stuck on step 6. Only normal
    // document navigations should be redirected away from completed onboarding.
    const isDocumentNavigation = request.method === "GET" || request.method === "HEAD";
    if (isDocumentNavigation && pathname.startsWith("/onboarding") && profile?.onboarding_completed) {
      const dashboardUrl = request.nextUrl.clone(); dashboardUrl.pathname = DASHBOARD_HOME; dashboardUrl.search = ""; return NextResponse.redirect(dashboardUrl);
    }
    return supabaseResponse;
  } catch (error) {
    console.error("[proxy] auth check failed:", error);
    return protectedPath ? redirectToLogin(request) : supabaseResponse;
  }
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
