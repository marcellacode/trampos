import type { PublicProfile, PublicProfileRow } from "@/lib/supabase/queries/public-profile";
import type {
  DbProfileCertificate,
  DbProfileExperience,
  DbProfileLanguage,
  DbProfileProject,
  DbProfileSkill,
} from "@/lib/supabase/types";
import { sortByOrder } from "@/lib/supabase/types";

export function mapPublicProfile(
  profile: PublicProfileRow,
  related: {
    experiences: DbProfileExperience[];
    skills: DbProfileSkill[];
    languages: DbProfileLanguage[];
    projects: DbProfileProject[];
    certificates: DbProfileCertificate[];
  }
): PublicProfile {
  return {
    id: profile.id,
    slug: profile.slug ?? "",
    fullName: profile.full_name || profile.first_name || "",
    avatarUrl: profile.avatar_url,
    avatarInitials: profile.avatar_initials || profile.initials || "?",
    currentRole: profile.current_role,
    headline: profile.headline || profile.current_role,
    location: profile.location,
    summary: profile.summary,
    seniority: profile.seniority,
    websiteUrl: profile.website_url,
    isPublic: profile.is_public,
    experiences: sortByOrder(related.experiences).map((item) => ({
      id: item.id,
      company: item.company,
      role: item.role,
      period: item.period_label,
      description: item.description,
    })),
    skills: sortByOrder(related.skills).map((item) => item.skill_name),
    languages: sortByOrder(related.languages).map((item) => ({
      id: item.id,
      name: item.name,
      level: item.level_label,
    })),
    projects: sortByOrder(related.projects).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      tech: sortByOrder(item.profile_project_tech ?? []).map(
        (tech) => tech.tech_name
      ),
    })),
    certificates: sortByOrder(related.certificates).map((item) => ({
      id: item.id,
      name: item.name,
      issuer: item.issuer,
      year: item.year_label,
    })),
  };
}
