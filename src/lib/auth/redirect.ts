/** Canonical landing route after login / onboarding completion. */
export const DASHBOARD_HOME = "/dashboard/inicio";

/** Allow only same-origin relative paths (blocks open redirects). */
export function sanitizeInternalPath(
  path: string | null | undefined,
  fallback = DASHBOARD_HOME
): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}
