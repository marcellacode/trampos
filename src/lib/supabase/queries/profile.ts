import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExtractedProfile, OnboardingData } from "@/types/onboarding";
import { mapExtractedProfile } from "@/lib/supabase/mappers/profile";
import type {
  DbProfile,
  DbProfileCertificate,
  DbProfileExperience,
  DbProfileLanguage,
  DbProfileProject,
  DbProfileSkill,
} from "@/lib/supabase/types";

export async function fetchProfileData(
  supabase: SupabaseClient,
  userId: string
): Promise<ExtractedProfile | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      full_name,
      first_name,
      avatar_url,
      initials,
      plan,
      current_role,
      summary,
      avatar_initials,
      seniority,
      goal_role,
      goal_location,
      goal_salary,
      goal_availability_label
    `
    )
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!profile) return null;

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

  return mapExtractedProfile(profile as DbProfile, {
    experiences: (experiencesResult.data ?? []) as DbProfileExperience[],
    skills: (skillsResult.data ?? []) as DbProfileSkill[],
    languages: (languagesResult.data ?? []) as DbProfileLanguage[],
    projects: (projectsResult.data ?? []) as DbProfileProject[],
    certificates: (certificatesResult.data ?? []) as DbProfileCertificate[],
  });
}

export async function persistOnboardingProfileToSupabase(
  supabase: SupabaseClient,
  userId: string,
  data: OnboardingData
): Promise<{ id: string }> {
  const profile = data.profile;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: profile.name,
      first_name: profile.name.split(" ")[0] || profile.name,
      initials: profile.avatarInitials.slice(0, 4),
      avatar_initials: profile.avatarInitials,
      current_role: profile.currentRole,
      summary: profile.summary,
      seniority: profile.seniority,
      import_method: data.importMethod,
      uploaded_resume_filename: data.uploadedFileName,
      goal_text: data.goalText,
      goal_role:
        data.goalChips.find((chip) => chip.category === "role")?.label ?? "",
      goal_location:
        data.goalChips.find((chip) => chip.category === "location")?.label ??
        "",
      goal_salary:
        data.goalChips.find((chip) => chip.category === "salary")?.label ?? "",
      goal_availability_label: data.availability ?? "",
      availability: data.availability,
      onboarding_completed: true,
      onboarding_step: "success",
    })
    .eq("id", userId);

  if (profileError) throw profileError;

  await supabase.from("profile_experiences").delete().eq("user_id", userId);
  await supabase.from("profile_skills").delete().eq("user_id", userId);
  await supabase.from("profile_languages").delete().eq("user_id", userId);
  await supabase.from("profile_certificates").delete().eq("user_id", userId);

  const { data: existingProjects } = await supabase
    .from("profile_projects")
    .select("id")
    .eq("user_id", userId);

  const projectIds = (existingProjects ?? []).map((item) => item.id);
  if (projectIds.length > 0) {
    await supabase
      .from("profile_project_tech")
      .delete()
      .in("project_id", projectIds);
  }
  await supabase.from("profile_projects").delete().eq("user_id", userId);
  await supabase.from("goal_chips").delete().eq("user_id", userId);
  await supabase.from("profile_work_models").delete().eq("user_id", userId);
  await supabase.from("profile_contract_types").delete().eq("user_id", userId);

  if (profile.experiences.length > 0) {
    const { error } = await supabase.from("profile_experiences").insert(
      profile.experiences.map((item, index) => ({
        user_id: userId,
        company: item.company,
        role: item.role,
        period_label: item.period,
        description: item.description,
        sort_order: index,
      }))
    );
    if (error) throw error;
  }

  if (profile.skills.length > 0) {
    const { error } = await supabase.from("profile_skills").insert(
      profile.skills.map((skill, index) => ({
        user_id: userId,
        skill_name: skill,
        sort_order: index,
      }))
    );
    if (error) throw error;
  }

  if (profile.languages.length > 0) {
    const { error } = await supabase.from("profile_languages").insert(
      profile.languages.map((language, index) => ({
        user_id: userId,
        name: language.name,
        level_label: language.level,
        sort_order: index,
      }))
    );
    if (error) throw error;
  }

  if (profile.certificates.length > 0) {
    const { error } = await supabase.from("profile_certificates").insert(
      profile.certificates.map((certificate, index) => ({
        user_id: userId,
        name: certificate.name,
        issuer: certificate.issuer,
        year_label: certificate.year,
        sort_order: index,
      }))
    );
    if (error) throw error;
  }

  for (const [index, project] of profile.projects.entries()) {
    const { data: insertedProject, error } = await supabase
      .from("profile_projects")
      .insert({
        user_id: userId,
        name: project.name,
        description: project.description,
        sort_order: index,
      })
      .select("id")
      .single();

    if (error) throw error;

    if (project.tech.length > 0) {
      const techError = await supabase.from("profile_project_tech").insert(
        project.tech.map((tech, techIndex) => ({
          project_id: insertedProject.id,
          tech_name: tech,
          sort_order: techIndex,
        }))
      );
      if (techError.error) throw techError.error;
    }
  }

  if (data.goalChips.length > 0) {
    const { error } = await supabase.from("goal_chips").insert(
      data.goalChips.map((chip, index) => ({
        user_id: userId,
        label: chip.label,
        category: chip.category,
        sort_order: index,
      }))
    );
    if (error) throw error;
  }

  if (data.workModels.length > 0) {
    const { error } = await supabase.from("profile_work_models").insert(
      data.workModels.map((model) => ({
        user_id: userId,
        work_model: model,
      }))
    );
    if (error) throw error;
  }

  if (data.contractTypes.length > 0) {
    const { error } = await supabase.from("profile_contract_types").insert(
      data.contractTypes.map((type) => ({
        user_id: userId,
        contract_type: type,
      }))
    );
    if (error) throw error;
  }

  return { id: userId };
}

export async function getCurrentUserId(
  supabase: SupabaseClient
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
