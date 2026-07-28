import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileVisibilitySettings } from "@/lib/supabase/queries/public-profile";

export interface UpdateProfileVisibilityInput {
  headline?: string;
  location?: string;
  websiteUrl?: string | null;
  isPublic?: boolean;
  autoPostEnabled?: boolean;
  showExperiencesPublic?: boolean;
  showEducationPublic?: boolean;
  showCertificatesPublic?: boolean;
  showProjectsPublic?: boolean;
}

export async function updateProfileVisibility(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateProfileVisibilityInput
): Promise<ProfileVisibilitySettings> {
  const payload: Record<string, unknown> = {};

  if (input.headline !== undefined) payload.headline = input.headline;
  if (input.location !== undefined) payload.location = input.location;
  if (input.isPublic !== undefined) payload.is_public = input.isPublic;
  if (input.autoPostEnabled !== undefined) payload.auto_post_enabled = input.autoPostEnabled;
  if (input.showExperiencesPublic !== undefined) {
    payload.show_experiences_public = input.showExperiencesPublic;
  }
  if (input.showEducationPublic !== undefined) {
    payload.show_education_public = input.showEducationPublic;
  }
  if (input.showCertificatesPublic !== undefined) {
    payload.show_certificates_public = input.showCertificatesPublic;
  }
  if (input.showProjectsPublic !== undefined) {
    payload.show_projects_public = input.showProjectsPublic;
  }
  if (input.websiteUrl !== undefined) {
    payload.website_url = input.websiteUrl?.trim() ? input.websiteUrl.trim() : null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select(
      "slug, headline, location, website_url, is_public, auto_post_enabled, show_experiences_public, show_education_public, show_certificates_public, show_projects_public"
    )
    .single();

  if (error) throw error;

  return {
    slug: data.slug,
    headline: data.headline,
    location: data.location,
    websiteUrl: data.website_url,
    isPublic: data.is_public,
    autoPostEnabled: data.auto_post_enabled ?? false,
    showExperiencesPublic: data.show_experiences_public ?? true,
    showEducationPublic: data.show_education_public ?? true,
    showCertificatesPublic: data.show_certificates_public ?? true,
    showProjectsPublic: data.show_projects_public ?? true,
  };
}
