import type { SupabaseClient } from "@supabase/supabase-js";
import { mapPublicProfile } from "@/lib/supabase/mappers/public-profile";
import type {
  DbProfileCertificate,
  DbProfileCourse,
  DbProfileEducation,
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
  show_experiences_public?: boolean;
  show_education_public?: boolean;
  show_certificates_public?: boolean;
  show_projects_public?: boolean;
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
  education: {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    period: string;
    description: string;
  }[];
  courses: {
    id: string;
    name: string;
    provider: string;
    completionDate: string | null;
    credentialUrl: string | null;
    description: string;
  }[];
}

export interface ProfileVisibilitySettings {
  slug: string | null;
  headline: string;
  location: string;
  websiteUrl: string | null;
  isPublic: boolean;
  autoPostEnabled: boolean;
  showExperiencesPublic: boolean;
  showEducationPublic: boolean;
  showCertificatesPublic: boolean;
  showProjectsPublic: boolean;
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

  const { data: visibilityRow } = await supabase
    .from("profiles")
    .select(
      "show_experiences_public, show_education_public, show_certificates_public, show_projects_public, is_public"
    )
    .eq("id", userId)
    .maybeSingle();

  const showExperiences = visibilityRow?.show_experiences_public ?? true;
  const showEducation = visibilityRow?.show_education_public ?? true;
  const showCertificates = visibilityRow?.show_certificates_public ?? true;
  const showProjects = visibilityRow?.show_projects_public ?? true;

  if (!profile.is_public) return null;

  const fetchExperiences = showExperiences
    ? supabase
        .from("profile_experiences")
        .select("id, company, role, period_label, description, sort_order")
        .eq("user_id", userId)
        .order("sort_order")
    : Promise.resolve({ data: [], error: null });

  const fetchEducation = showEducation
    ? supabase
        .from("profile_education")
        .select(
          "id, institution, degree, field_of_study, start_date, end_date, is_current, description, sort_order"
        )
        .eq("user_id", userId)
        .order("sort_order")
    : Promise.resolve({ data: [], error: null });

  const fetchCertificates = showCertificates
    ? supabase
        .from("profile_certificates")
        .select("id, name, issuer, year_label, sort_order")
        .eq("user_id", userId)
        .order("sort_order")
    : Promise.resolve({ data: [], error: null });

  const fetchProjects = showProjects
    ? supabase
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
        .order("sort_order")
    : Promise.resolve({ data: [], error: null });

  const [
    experiencesResult,
    skillsResult,
    languagesResult,
    projectsResult,
    certificatesResult,
    educationResult,
    coursesResult,
  ] = await Promise.all([
    fetchExperiences,
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
    fetchProjects,
    fetchCertificates,
    fetchEducation,
    showEducation
      ? supabase
          .from("profile_courses")
          .select(
            "id, name, provider, completion_date, credential_url, description, sort_order"
          )
          .eq("user_id", userId)
          .order("sort_order")
      : Promise.resolve({ data: [], error: null }),
  ]);

  for (const result of [
    experiencesResult,
    skillsResult,
    languagesResult,
    projectsResult,
    certificatesResult,
    educationResult,
    coursesResult,
  ]) {
    if (result.error) throw result.error;
  }

  return mapPublicProfile(profile as PublicProfileRow, {
    experiences: (experiencesResult.data ?? []) as DbProfileExperience[],
    skills: (skillsResult.data ?? []) as DbProfileSkill[],
    languages: (languagesResult.data ?? []) as DbProfileLanguage[],
    projects: (projectsResult.data ?? []) as DbProfileProject[],
    certificates: (certificatesResult.data ?? []) as DbProfileCertificate[],
    education: (educationResult.data ?? []) as DbProfileEducation[],
    courses: (coursesResult.data ?? []) as DbProfileCourse[],
  });
}

export async function fetchProfileVisibilitySettings(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileVisibilitySettings | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "slug, headline, location, website_url, is_public, auto_post_enabled, show_experiences_public, show_education_public, show_certificates_public, show_projects_public"
    )
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
    autoPostEnabled: data.auto_post_enabled ?? false,
    showExperiencesPublic: data.show_experiences_public ?? true,
    showEducationPublic: data.show_education_public ?? true,
    showCertificatesPublic: data.show_certificates_public ?? true,
    showProjectsPublic: data.show_projects_public ?? true,
  };
}
