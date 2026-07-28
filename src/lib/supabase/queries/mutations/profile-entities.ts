import type { SupabaseClient } from "@supabase/supabase-js";
import { createCrud } from "@/lib/supabase/crud/factory";

export interface ProfileExperienceRow {
  id: string;
  user_id: string;
  company: string;
  role: string;
  period_label: string;
  description: string;
  sort_order: number;
}

export interface ProfileSkillRow {
  user_id: string;
  skill_name: string;
  sort_order: number;
}

export interface ProfileLanguageRow {
  id: string;
  user_id: string;
  name: string;
  level_label: string;
  sort_order: number;
}

export interface ProfileCertificateRow {
  id: string;
  user_id: string;
  name: string;
  issuer: string;
  year_label: string;
  sort_order: number;
}

export interface ProfileEducationRow {
  id: string;
  user_id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string;
  sort_order: number;
}

export interface ProfileCourseRow {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  completion_date: string | null;
  credential_url: string | null;
  description: string;
  sort_order: number;
}

export interface ProfileProjectRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  sort_order: number;
}

const experienceCrud = createCrud<
  ProfileExperienceRow,
  Omit<ProfileExperienceRow, "id" | "user_id">,
  Partial<Omit<ProfileExperienceRow, "id" | "user_id">>
>("profile_experiences", { orderColumn: "sort_order", ascending: true });

const languageCrud = createCrud<
  ProfileLanguageRow,
  Omit<ProfileLanguageRow, "id" | "user_id">,
  Partial<Omit<ProfileLanguageRow, "id" | "user_id">>
>("profile_languages", { orderColumn: "sort_order", ascending: true });

const certificateCrud = createCrud<
  ProfileCertificateRow,
  Omit<ProfileCertificateRow, "id" | "user_id">,
  Partial<Omit<ProfileCertificateRow, "id" | "user_id">>
>("profile_certificates", { orderColumn: "sort_order", ascending: true });

const educationCrud = createCrud<
  ProfileEducationRow,
  Omit<ProfileEducationRow, "id" | "user_id">,
  Partial<Omit<ProfileEducationRow, "id" | "user_id">>
>("profile_education", { orderColumn: "sort_order", ascending: true });

const courseCrud = createCrud<
  ProfileCourseRow,
  Omit<ProfileCourseRow, "id" | "user_id">,
  Partial<Omit<ProfileCourseRow, "id" | "user_id">>
>("profile_courses", { orderColumn: "sort_order", ascending: true });

const projectCrud = createCrud<
  ProfileProjectRow,
  Omit<ProfileProjectRow, "id" | "user_id">,
  Partial<Omit<ProfileProjectRow, "id" | "user_id">>
>("profile_projects", { orderColumn: "sort_order", ascending: true });

export const listExperiences = experienceCrud.list;
export const createExperience = experienceCrud.create;
export const updateExperience = experienceCrud.update;
export const deleteExperience = experienceCrud.remove;

export const listLanguages = languageCrud.list;
export const createLanguage = languageCrud.create;
export const updateLanguage = languageCrud.update;
export const deleteLanguage = languageCrud.remove;

export const listCertificates = certificateCrud.list;
export const createCertificate = certificateCrud.create;
export const updateCertificate = certificateCrud.update;
export const deleteCertificate = certificateCrud.remove;

export const listEducation = educationCrud.list;
export const createEducation = educationCrud.create;
export const updateEducation = educationCrud.update;
export const deleteEducation = educationCrud.remove;

export const listCourses = courseCrud.list;
export const createCourse = courseCrud.create;
export const updateCourse = courseCrud.update;
export const deleteCourse = courseCrud.remove;

export const listProjects = projectCrud.list;
export const createProject = projectCrud.create;
export const updateProject = projectCrud.update;
export const deleteProject = projectCrud.remove;

export async function listSkills(
  supabase: SupabaseClient,
  userId: string
): Promise<ProfileSkillRow[]> {
  const { data, error } = await supabase
    .from("profile_skills")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as ProfileSkillRow[];
}

export async function createSkill(
  supabase: SupabaseClient,
  userId: string,
  skillName: string,
  sortOrder = 0
): Promise<ProfileSkillRow> {
  const { data, error } = await supabase
    .from("profile_skills")
    .insert({ user_id: userId, skill_name: skillName, sort_order: sortOrder })
    .select("*")
    .single();

  if (error) throw error;
  return data as ProfileSkillRow;
}

export async function deleteSkill(
  supabase: SupabaseClient,
  userId: string,
  skillName: string
): Promise<void> {
  const { error } = await supabase
    .from("profile_skills")
    .delete()
    .eq("user_id", userId)
    .eq("skill_name", skillName);

  if (error) throw error;
}

export async function listProjectTech(
  supabase: SupabaseClient,
  projectId: string
): Promise<{ tech_name: string; sort_order: number }[]> {
  const { data, error } = await supabase
    .from("profile_project_tech")
    .select("tech_name, sort_order")
    .eq("project_id", projectId)
    .order("sort_order");

  if (error) throw error;
  return data ?? [];
}

export async function setProjectTech(
  supabase: SupabaseClient,
  projectId: string,
  tech: string[]
): Promise<void> {
  await supabase.from("profile_project_tech").delete().eq("project_id", projectId);

  if (tech.length === 0) return;

  const { error } = await supabase.from("profile_project_tech").insert(
    tech.map((techName, index) => ({
      project_id: projectId,
      tech_name: techName,
      sort_order: index,
    }))
  );

  if (error) throw error;
}

export async function updateProfileSummary(
  supabase: SupabaseClient,
  userId: string,
  input: {
    current_role?: string;
    summary?: string;
    seniority?: string;
  }
): Promise<void> {
  const { error } = await supabase.from("profiles").update(input).eq("id", userId);
  if (error) throw error;
}
