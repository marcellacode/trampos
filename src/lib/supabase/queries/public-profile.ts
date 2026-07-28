import type { SupabaseClient } from "@supabase/supabase-js";
import { mapPublicProfile } from "@/lib/supabase/mappers/public-profile";
import type {
  DbProfileCertificate,
  DbProfileExperience,
  DbProfileLanguage,
  DbProfileProject,
  DbProfileSkill,
} from "@/lib/supabase/types";

export interface PublicProfileRow {
  id: string;
  slug: string | null;
  full_name: string;
  first_name: string;
  avatar_url: string | null;
  initials: string;
  avatar_initials: string;
  current_role: string;
  headline: string;
  location: string;
  summary: string;
  seniority: string;
  website_url: string | null;
  is_public: boolean;
}

export interface PublicProfile {
  id: string;
  slug: string;
  fullName: string;
  avatarUrl: string | null;
  avatarInitials: string;
  currentRole: string;
  headline: string;
  location: string;
  summary: string;
  seniority: string;
  websiteUrl: string | null;
  isPublic: boolean;
  experiences: {
    id: string;
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  skills: string[];
  languages: { id: string; name: string; level: string }[];
  projects: {
    id: string;
    name: string;
    description: string;
    tech: string[];
  }[];
  certificates: {
    id: string;
    name: string;
    issuer: string;
    year: string;
  }[];
}

export interface ProfileVisibilitySettings {
  slug: string | null;
  headline: string;
  location: string;
  websiteUrl: string | null;
  isPublic: boolean;
}

const PROFILE_SELECT = `
  id,
  slug,
  full_name,
  first_name,
  avatar_url,
  initials,
  avatar_initials,
  current_role,
  headline,
  location,
  summary,
  seniority,
  website_url,
  is_public
`;

export async function fetchPublicProfileBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<PublicProfile | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!profile?.slug) return null;

  const userId = profile.id;

  const [
    experiencesResult,
    skillsResult,
    languagesResult,
    projectsResult,
    certificatesResult,
  ] = await Promise.all([
    supabase
      .from("profile_experiences")
      .select("id, company, role, period_label, description, sort_order")
      .eq("user_id", userId)
      .order("sort_order"),
    supabase
      .from("profile_skills")
      .select("skill_name, sort_order")
      .eq("user_id", userId)
      .order("sort_order"),
    supabase
      .from("profile_languages")
      .select("id, name, level_label, sort_order")
      .eq("user_id", userId)
      .order("sort_order"),
    supabase
      .from("profile_projects")
      .select(
        `
        id,
        name,
        description,
        sort_order,
        profile_project_tech (tech_name, sort_order)
      `
      )
      .eq("user_id", userId)
      .order("sort_order"),
    supabase
      .from("profile_certificates")
      .select("id, name, issuer, year_label, sort_order")
      .eq("user_id", userId)
      .order("sort_order"),
  ]);

  for (const result of [
    experiencesResult,
    skillsResult,
    languagesResult,
    projectsResult,
    certificatesResult,
  ]) {
    if (result.error) throw result.error;
  }

  return mapPublicProfile(profile as PublicProfileRow, {
    experiences: (experiencesResult.data ?? []) as DbProfileExperience[],
    skills: (skillsResult.data ?? []) as DbProfileSkill[],
    languages: (languagesResult.data ?? []) as DbProfileLanguage[],
    projects: (projectsResult.data ?? []) as DbProfileProject[],
    certificates: (certificatesResult.data ?? []) as DbProfileCertificate[],
  });
}

export async function fetchProfileVisibilitySettings(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileVisibilitySettings | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("slug, headline, location, website_url, is_public")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    slug: data.slug,
    headline: data.headline,
    location: data.location,
    websiteUrl: data.website_url,
    isPublic: data.is_public,
  };
}
