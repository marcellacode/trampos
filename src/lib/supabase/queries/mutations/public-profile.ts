import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileVisibilitySettings } from "@/lib/supabase/queries/public-profile";

export interface UpdateProfileVisibilityInput {
  headline?: string;
  location?: string;
  websiteUrl?: string | null;
  isPublic?: boolean;
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
  if (input.websiteUrl !== undefined) {
    payload.website_url = input.websiteUrl?.trim() ? input.websiteUrl.trim() : null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("slug, headline, location, website_url, is_public")
    .single();

  if (error) throw error;

  return {
    slug: data.slug,
    headline: data.headline,
    location: data.location,
    websiteUrl: data.website_url,
    isPublic: data.is_public,
  };
}
