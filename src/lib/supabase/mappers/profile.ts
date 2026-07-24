import type { ExtractedProfile } from "@/types/onboarding";
import type {
  DbProfile,
  DbProfileCertificate,
  DbProfileExperience,
  DbProfileLanguage,
  DbProfileProject,
  DbProfileSkill,
} from "@/lib/supabase/types";
import { sortByOrder } from "@/lib/supabase/types";

export function mapExtractedProfile(
  profile: DbProfile,
  related: {
    experiences: DbProfileExperience[];
    skills: DbProfileSkill[];
    languages: DbProfileLanguage[];
    projects: DbProfileProject[];
    certificates: DbProfileCertificate[];
  }
): ExtractedProfile {
  return {
    name: profile.full_name || profile.first_name || "",
    currentRole: profile.current_role,
    summary: profile.summary,
    avatarInitials: profile.avatar_initials || profile.initials || "?",
    seniority: profile.seniority,
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
