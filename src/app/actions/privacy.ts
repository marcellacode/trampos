"use server";

import type { ActionResult } from "@/app/actions/ai";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import { fromExtendedTable } from "@/lib/supabase/extended-client";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export async function exportUserDataAction(): Promise<
  ActionResult<{ json: string; filename: string }>
> {
  try {
    const { supabase, user } = await requireAuth();

    const [
      profile,
      experiences,
      skills,
      projects,
      certificates,
      education,
      courses,
      applications,
      posts,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("profile_experiences").select("*").eq("user_id", user.id),
      supabase.from("profile_skills").select("*").eq("user_id", user.id),
      supabase.from("profile_projects").select("*").eq("user_id", user.id),
      supabase.from("profile_certificates").select("*").eq("user_id", user.id),
      supabase.from("profile_education").select("*").eq("user_id", user.id),
      supabase.from("profile_courses").select("*").eq("user_id", user.id),
      supabase
        .from("job_applications")
        .select(
          "id, role_title, status, status_label, applied_at, application_source, submission_status"
        )
        .eq("user_id", user.id),
      fromExtendedTable(supabase, "posts")
        .select("id, content, visibility, post_source, source_event_kind, created_at")
        .eq("author_user_id", user.id),
    ]);

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      profile: profile.data,
      experiences: experiences.data ?? [],
      skills: skills.data ?? [],
      projects: projects.data ?? [],
      certificates: certificates.data ?? [],
      education: education.data ?? [],
      courses: courses.data ?? [],
      applications: applications.data ?? [],
      posts: posts.data ?? [],
    };

    const date = new Date().toISOString().slice(0, 10);
    return {
      success: true,
      data: {
        json: JSON.stringify(exportPayload, null, 2),
        filename: `jobera-dados-${date}.json`,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
