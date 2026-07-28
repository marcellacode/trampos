"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/supabase/queries/profile";
import {
  fetchCompanyMemberships,
  fetchEditableCompany,
} from "@/lib/supabase/queries/company";
import {
  applyToJob,
  createJobApplication,
  deleteJobApplication,
  listJobApplications,
  updateJobApplication,
  type CreateJobApplicationInput,
  type UpdateJobApplicationInput,
} from "@/lib/supabase/queries/mutations/applications";
import {
  createChatMessage,
  deleteChatMessage,
  listChatMessagesByContext,
  markChatContextRead,
  updateChatMessage,
  type CreateChatMessageInput,
} from "@/lib/supabase/queries/mutations/chat";
import {
  completeDailyMission,
  createDailyMission,
  createEmployabilitySkill,
  deleteDailyMission,
  deleteEmployabilitySkill,
  getEmployabilityOverview,
  listDailyMissions,
  listEmployabilitySkills,
  updateDailyMission,
  updateEmployabilitySkill,
  upsertEmployabilityOverview,
  type CreateDailyMissionInput,
  type CreateEmployabilitySkillInput,
  type UpdateDailyMissionInput,
  type UpdateEmployabilitySkillInput,
} from "@/lib/supabase/queries/mutations/employability";
import {
  createGoalChip,
  createSmartFilter,
  deleteGoalChip,
  deleteSmartFilter,
  listGoalChips,
  listSmartFilters,
  updateGoalChip,
  updateProfileGoals,
  updateSmartFilter,
  type CreateGoalChipInput,
  type CreateSmartFilterInput,
  type UpdateGoalChipInput,
  type UpdateSmartFilterInput,
} from "@/lib/supabase/queries/mutations/goals";
import {
  createNotification,
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotification,
  type CreateNotificationInput,
  type UpdateNotificationInput,
} from "@/lib/supabase/queries/mutations/notifications";
import {
  createCertificate,
  createCourse,
  createEducation,
  createExperience,
  createLanguage,
  createProject,
  createSkill,
  deleteCertificate,
  deleteCourse,
  deleteEducation,
  deleteExperience,
  deleteLanguage,
  deleteProject,
  deleteSkill,
  listCertificates,
  listCourses,
  listEducation,
  listExperiences,
  listLanguages,
  listProjects,
  listSkills,
  setProjectTech,
  updateCertificate,
  updateCourse,
  updateEducation,
  updateExperience,
  updateLanguage,
  updateProfileSummary,
  updateProject,
} from "@/lib/supabase/queries/mutations/profile-entities";
import { hideJobByRef } from "@/lib/supabase/queries/mutations/saved-jobs";
import {
  addFavoriteCompany,
  createOauthConnection,
  createResumeUpload,
  deleteOauthConnection,
  deleteResumeUpload,
  listHiddenJobs,
  listOauthConnections,
  listResumeUploads,
  listUserCompanyMatches,
  removeFavoriteCompany,
  unhideJob,
  updateFavoriteCompany,
  updateOauthConnection,
  updateProfileSettings,
  updateResumeUpload,
  type CreateOauthConnectionInput,
  type CreateResumeUploadInput,
  type UpdateOauthConnectionInput,
  type UpdateResumeUploadInput,
} from "@/lib/supabase/queries/mutations/settings";
import {
  updateProfileVisibility,
  type UpdateProfileVisibilityInput,
} from "@/lib/supabase/queries/mutations/public-profile";
import { fetchProfileVisibilitySettings } from "@/lib/supabase/queries/public-profile";
import {
  createTimelineEvent,
  deleteTimelineEvent,
  listTimelineEvents,
  listTimelineEventsByKind,
  updateTimelineEvent,
  type CreateTimelineEventInput,
  type UpdateTimelineEventInput,
} from "@/lib/supabase/queries/mutations/timeline";
import { crudKeys } from "@/lib/crud/query-keys";

function scheduleMatchResyncInBackground() {
  void import("@/lib/matching/match-action")
    .then(({ scheduleMatchResyncAction }) => scheduleMatchResyncAction())
    .catch(() => {});
}

const MATCH_RESYNC_KEYS: readonly (readonly unknown[])[] = [
  crudKeys.profile,
  crudKeys.experiences,
  crudKeys.skills,
  crudKeys.languages,
  crudKeys.certificates,
  crudKeys.goalChips,
];

function queryKeysEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function shouldResyncMatchesForKeys(keys: readonly unknown[]): boolean {
  return MATCH_RESYNC_KEYS.some((resyncKey) => queryKeysEqual(keys, resyncKey));
}

async function withUser<T>(
  fn: (supabase: ReturnType<typeof createBrowserSupabaseClient>, userId: string) => Promise<T>
): Promise<T> {
  const supabase = createBrowserSupabaseClient();
  const userId = await getCurrentUserId(supabase);
  if (!userId) throw new Error("Usuário não autenticado.");
  return fn(supabase, userId);
}

function useInvalidate(keys: readonly unknown[]) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: keys });
    void queryClient.invalidateQueries({ queryKey: crudKeys.dashboard });
  };
}

function useCrudMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  invalidateKeys: readonly unknown[],
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const invalidate = useInvalidate(invalidateKeys);
  const shouldResyncMatches = shouldResyncMatchesForKeys(invalidateKeys);

  return useMutation({
    mutationFn,
    onSuccess: (...args) => {
      invalidate();
      if (shouldResyncMatches) {
        scheduleMatchResyncInBackground();
      }
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useJobApplications() {
  return useQuery({
    queryKey: crudKeys.applications,
    queryFn: () => withUser(listJobApplications),
  });
}

export function useCreateJobApplication() {
  return useCrudMutation(
    (input: CreateJobApplicationInput) => withUser((s, u) => createJobApplication(s, u, input)),
    crudKeys.applications
  );
}

export function useUpdateJobApplication() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: UpdateJobApplicationInput }) =>
      withUser((s, u) => updateJobApplication(s, u, id, input)),
    crudKeys.applications
  );
}

export function useDeleteJobApplication() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteJobApplication(s, u, id)),
    crudKeys.applications
  );
}

export function useApplyToJob() {
  return useCrudMutation(
    (input: {
      jobId: string;
      companyId: string;
      roleTitle: string;
      companyName?: string;
    }) => withUser((s, u) => applyToJob(s, u, input)),
    crudKeys.applications
  );
}

export function useNotifications() {
  return useQuery({
    queryKey: crudKeys.notifications,
    queryFn: () => withUser(listNotifications),
  });
}

export function useCreateNotification() {
  return useCrudMutation(
    (input: CreateNotificationInput) => withUser((s, u) => createNotification(s, u, input)),
    crudKeys.notifications
  );
}

export function useUpdateNotification() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: UpdateNotificationInput }) =>
      withUser((s, u) => updateNotification(s, u, id, input)),
    crudKeys.notifications
  );
}

export function useDeleteNotification() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteNotification(s, u, id)),
    crudKeys.notifications
  );
}

export function useMarkNotificationRead() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => markNotificationRead(s, u, id)),
    crudKeys.notifications
  );
}

export function useMarkAllNotificationsRead() {
  return useCrudMutation(
    () => withUser((s, u) => markAllNotificationsRead(s, u)),
    crudKeys.notifications
  );
}

export function useChatMessages(context = "dashboard") {
  return useQuery({
    queryKey: crudKeys.chat(context),
    queryFn: () => withUser((s, u) => listChatMessagesByContext(s, u, context)),
  });
}

export function useSendChatMessage(context = "dashboard") {
  return useCrudMutation(
    (input: Omit<CreateChatMessageInput, "context">) =>
      withUser((s, u) =>
        createChatMessage(s, u, { ...input, context, role: input.role ?? "user" })
      ),
    crudKeys.chat(context)
  );
}

export function useUpdateChatMessage(context = "dashboard") {
  return useCrudMutation(
    ({ id, content }: { id: string; content: string }) =>
      withUser((s, u) => updateChatMessage(s, u, id, { content })),
    crudKeys.chat(context)
  );
}

export function useDeleteChatMessage(context = "dashboard") {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteChatMessage(s, u, id)),
    crudKeys.chat(context)
  );
}

export function useMarkChatRead(context = "dashboard") {
  return useCrudMutation<void, void>(
    () => withUser((s, u) => markChatContextRead(s, u, context)),
    crudKeys.chat(context)
  );
}

export function useTimelineEvents(kind?: string) {
  return useQuery({
    queryKey: crudKeys.timeline(kind),
    queryFn: () =>
      withUser((s, u) =>
        kind ? listTimelineEventsByKind(s, u, kind) : listTimelineEvents(s, u)
      ),
  });
}

export function useCreateTimelineEvent() {
  return useCrudMutation(
    (input: CreateTimelineEventInput) => withUser((s, u) => createTimelineEvent(s, u, input)),
    crudKeys.timeline()
  );
}

export function useUpdateTimelineEvent() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: UpdateTimelineEventInput }) =>
      withUser((s, u) => updateTimelineEvent(s, u, id, input)),
    crudKeys.timeline()
  );
}

export function useDeleteTimelineEvent() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteTimelineEvent(s, u, id)),
    crudKeys.timeline()
  );
}

export function useGoalChips() {
  return useQuery({
    queryKey: crudKeys.goalChips,
    queryFn: () => withUser(listGoalChips),
  });
}

export function useCreateGoalChip() {
  return useCrudMutation(
    (input: CreateGoalChipInput) => withUser((s, u) => createGoalChip(s, u, input)),
    crudKeys.goalChips
  );
}

export function useUpdateGoalChip() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: UpdateGoalChipInput }) =>
      withUser((s, u) => updateGoalChip(s, u, id, input)),
    crudKeys.goalChips
  );
}

export function useDeleteGoalChip() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteGoalChip(s, u, id)),
    crudKeys.goalChips
  );
}

export function useSmartFilters() {
  return useQuery({
    queryKey: crudKeys.smartFilters,
    queryFn: () => withUser(listSmartFilters),
  });
}

export function useCreateSmartFilter() {
  return useCrudMutation(
    (input: CreateSmartFilterInput) => withUser((s, u) => createSmartFilter(s, u, input)),
    crudKeys.smartFilters
  );
}

export function useUpdateSmartFilter() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: UpdateSmartFilterInput }) =>
      withUser((s, u) => updateSmartFilter(s, u, id, input)),
    crudKeys.smartFilters
  );
}

export function useDeleteSmartFilter() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteSmartFilter(s, u, id)),
    crudKeys.smartFilters
  );
}

export function useUpdateProfileGoals() {
  return useCrudMutation(
    (input: Parameters<typeof updateProfileGoals>[2]) =>
      withUser((s, u) => updateProfileGoals(s, u, input)),
    crudKeys.profile
  );
}

export function useDailyMissions() {
  return useQuery({
    queryKey: crudKeys.dailyMissions,
    queryFn: () => withUser(listDailyMissions),
  });
}

export function useCreateDailyMission() {
  return useCrudMutation(
    (input: CreateDailyMissionInput) => withUser((s, u) => createDailyMission(s, u, input)),
    crudKeys.dailyMissions
  );
}

export function useUpdateDailyMission() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: UpdateDailyMissionInput }) =>
      withUser((s, u) => updateDailyMission(s, u, id, input)),
    crudKeys.dailyMissions
  );
}

export function useCompleteDailyMission() {
  const invalidateMissions = useInvalidate(crudKeys.dailyMissions);
  const invalidateOverview = useInvalidate(crudKeys.employabilityOverview);
  return useMutation({
    mutationFn: (id: string) => withUser((s, u) => completeDailyMission(s, u, id)),
    onSuccess: () => {
      invalidateMissions();
      invalidateOverview();
    },
  });
}

export function useDeleteDailyMission() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteDailyMission(s, u, id)),
    crudKeys.dailyMissions
  );
}

export function useEmployabilitySkills() {
  return useQuery({
    queryKey: crudKeys.employabilitySkills,
    queryFn: () => withUser(listEmployabilitySkills),
  });
}

export function useEmployabilityOverview() {
  return useQuery({
    queryKey: crudKeys.employabilityOverview,
    queryFn: () => withUser(getEmployabilityOverview),
  });
}

export function useUpsertEmployabilityOverview() {
  return useCrudMutation(
    (input: { score?: number; goal_score?: number }) =>
      withUser((s, u) => upsertEmployabilityOverview(s, u, input)),
    crudKeys.employabilityOverview
  );
}

export function useCreateEmployabilitySkill() {
  return useCrudMutation(
    (input: CreateEmployabilitySkillInput) =>
      withUser((s, u) => createEmployabilitySkill(s, u, input)),
    crudKeys.employabilitySkills
  );
}

export function useUpdateEmployabilitySkill() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: UpdateEmployabilitySkillInput }) =>
      withUser((s, u) => updateEmployabilitySkill(s, u, id, input)),
    crudKeys.employabilitySkills
  );
}

export function useDeleteEmployabilitySkill() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteEmployabilitySkill(s, u, id)),
    crudKeys.employabilitySkills
  );
}

export function useHiddenJobs() {
  return useQuery({
    queryKey: crudKeys.hiddenJobs,
    queryFn: () => withUser(listHiddenJobs),
  });
}

export function useHideJob() {
  return useCrudMutation(
    ({ jobId, reason }: { jobId: string; reason?: string }) =>
      withUser((s, u) => hideJobByRef(s, u, jobId, reason)),
    crudKeys.hiddenJobs
  );
}

export function useUnhideJob() {
  return useCrudMutation(
    (jobId: string) => withUser((s, u) => unhideJob(s, u, jobId)),
    crudKeys.hiddenJobs
  );
}

export function useFavoriteCompanies() {
  return useQuery({
    queryKey: crudKeys.favoriteCompanies,
    queryFn: () => withUser(listUserCompanyMatches),
  });
}

export function useAddFavoriteCompany() {
  return useCrudMutation(
    ({ companyId, compatibility }: { companyId: string; compatibility?: number }) =>
      withUser((s, u) => addFavoriteCompany(s, u, companyId, compatibility)),
    crudKeys.favoriteCompanies
  );
}

export function useUpdateFavoriteCompany() {
  return useCrudMutation(
    ({ companyId, compatibility }: { companyId: string; compatibility: number }) =>
      withUser((s, u) => updateFavoriteCompany(s, u, companyId, compatibility)),
    crudKeys.favoriteCompanies
  );
}

export function useRemoveFavoriteCompany() {
  return useCrudMutation(
    (companyId: string) => withUser((s, u) => removeFavoriteCompany(s, u, companyId)),
    crudKeys.favoriteCompanies
  );
}

export function useResumeUploads() {
  return useQuery({
    queryKey: crudKeys.resumeUploads,
    queryFn: () => withUser(listResumeUploads),
  });
}

export function useCreateResumeUpload() {
  return useCrudMutation(
    (input: CreateResumeUploadInput) => withUser((s, u) => createResumeUpload(s, u, input)),
    crudKeys.resumeUploads
  );
}

export function useUpdateResumeUpload() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: UpdateResumeUploadInput }) =>
      withUser((s, u) => updateResumeUpload(s, u, id, input)),
    crudKeys.resumeUploads
  );
}

export function useDeleteResumeUpload() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteResumeUpload(s, u, id)),
    crudKeys.resumeUploads
  );
}

export function useOauthConnections() {
  return useQuery({
    queryKey: crudKeys.oauthConnections,
    queryFn: () => withUser(listOauthConnections),
  });
}

export function useCreateOauthConnection() {
  return useCrudMutation(
    (input: CreateOauthConnectionInput) =>
      withUser((s, u) => createOauthConnection(s, u, input)),
    crudKeys.oauthConnections
  );
}

export function useUpdateOauthConnection() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: UpdateOauthConnectionInput }) =>
      withUser((s, u) => updateOauthConnection(s, u, id, input)),
    crudKeys.oauthConnections
  );
}

export function useDeleteOauthConnection() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteOauthConnection(s, u, id)),
    crudKeys.oauthConnections
  );
}

export function useUpdateProfileSettings() {
  return useCrudMutation(
    (input: Parameters<typeof updateProfileSettings>[2]) =>
      withUser((s, u) => updateProfileSettings(s, u, input)),
    crudKeys.profile
  );
}

export function useExperiences() {
  return useQuery({
    queryKey: crudKeys.experiences,
    queryFn: () => withUser(listExperiences),
  });
}

export function useCreateExperience() {
  return useCrudMutation(
    (input: Parameters<typeof createExperience>[2]) =>
      withUser((s, u) => createExperience(s, u, input)),
    crudKeys.experiences
  );
}

export function useUpdateExperience() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: Parameters<typeof updateExperience>[3] }) =>
      withUser((s, u) => updateExperience(s, u, id, input)),
    crudKeys.experiences
  );
}

export function useDeleteExperience() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteExperience(s, u, id)),
    crudKeys.experiences
  );
}

export function useSkills() {
  return useQuery({
    queryKey: crudKeys.skills,
    queryFn: () => withUser(listSkills),
  });
}

export function useCreateSkill() {
  return useCrudMutation(
    ({ skillName, sortOrder }: { skillName: string; sortOrder?: number }) =>
      withUser((s, u) => createSkill(s, u, skillName, sortOrder)),
    crudKeys.skills
  );
}

export function useDeleteSkill() {
  return useCrudMutation(
    (skillName: string) => withUser((s, u) => deleteSkill(s, u, skillName)),
    crudKeys.skills
  );
}

export function useLanguages() {
  return useQuery({
    queryKey: crudKeys.languages,
    queryFn: () => withUser(listLanguages),
  });
}

export function useCreateLanguage() {
  return useCrudMutation(
    (input: Parameters<typeof createLanguage>[2]) =>
      withUser((s, u) => createLanguage(s, u, input)),
    crudKeys.languages
  );
}

export function useUpdateLanguage() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: Parameters<typeof updateLanguage>[3] }) =>
      withUser((s, u) => updateLanguage(s, u, id, input)),
    crudKeys.languages
  );
}

export function useDeleteLanguage() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteLanguage(s, u, id)),
    crudKeys.languages
  );
}

export function useCertificates() {
  return useQuery({
    queryKey: crudKeys.certificates,
    queryFn: () => withUser(listCertificates),
  });
}

export function useCreateCertificate() {
  return useCrudMutation(
    (input: Parameters<typeof createCertificate>[2]) =>
      withUser((s, u) => createCertificate(s, u, input)),
    crudKeys.certificates
  );
}

export function useUpdateCertificate() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: Parameters<typeof updateCertificate>[3] }) =>
      withUser((s, u) => updateCertificate(s, u, id, input)),
    crudKeys.certificates
  );
}

export function useDeleteCertificate() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteCertificate(s, u, id)),
    crudKeys.certificates
  );
}

export function useEducation() {
  return useQuery({
    queryKey: crudKeys.education,
    queryFn: () => withUser(listEducation),
  });
}

export function useCreateEducation() {
  return useCrudMutation(
    (input: Parameters<typeof createEducation>[2]) =>
      withUser((s, u) => createEducation(s, u, input)),
    crudKeys.education
  );
}

export function useUpdateEducation() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: Parameters<typeof updateEducation>[3] }) =>
      withUser((s, u) => updateEducation(s, u, id, input)),
    crudKeys.education
  );
}

export function useDeleteEducation() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteEducation(s, u, id)),
    crudKeys.education
  );
}

export function useCourses() {
  return useQuery({
    queryKey: crudKeys.courses,
    queryFn: () => withUser(listCourses),
  });
}

export function useCreateCourse() {
  return useCrudMutation(
    (input: Parameters<typeof createCourse>[2]) =>
      withUser((s, u) => createCourse(s, u, input)),
    crudKeys.courses
  );
}

export function useUpdateCourse() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: Parameters<typeof updateCourse>[3] }) =>
      withUser((s, u) => updateCourse(s, u, id, input)),
    crudKeys.courses
  );
}

export function useDeleteCourse() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteCourse(s, u, id)),
    crudKeys.courses
  );
}

export function useProjects() {
  return useQuery({
    queryKey: crudKeys.projects,
    queryFn: () => withUser(listProjects),
  });
}

export function useCreateProject() {
  return useCrudMutation(
    (input: Parameters<typeof createProject>[2]) =>
      withUser((s, u) => createProject(s, u, input)),
    crudKeys.projects
  );
}

export function useUpdateProject() {
  return useCrudMutation(
    ({ id, input }: { id: string; input: Parameters<typeof updateProject>[3] }) =>
      withUser((s, u) => updateProject(s, u, id, input)),
    crudKeys.projects
  );
}

export function useDeleteProject() {
  return useCrudMutation(
    (id: string) => withUser((s, u) => deleteProject(s, u, id)),
    crudKeys.projects
  );
}

export function useSetProjectTech() {
  return useCrudMutation(
    ({ projectId, tech }: { projectId: string; tech: string[] }) =>
      withUser((s) => setProjectTech(s, projectId, tech)),
    crudKeys.projects
  );
}

export function useUpdateProfileSummary() {
  return useCrudMutation(
    (input: Parameters<typeof updateProfileSummary>[2]) =>
      withUser((s, u) => updateProfileSummary(s, u, input)),
    crudKeys.profile
  );
}

export function useProfileVisibility() {
  return useQuery({
    queryKey: crudKeys.profileVisibility,
    queryFn: () => withUser(fetchProfileVisibilitySettings),
  });
}

export function useUpdateProfileVisibility() {
  return useCrudMutation(
    (input: UpdateProfileVisibilityInput) =>
      withUser((s, u) => updateProfileVisibility(s, u, input)),
    crudKeys.profileVisibility
  );
}

export function useCompanyMemberships() {
  return useQuery({
    queryKey: crudKeys.companyMemberships,
    queryFn: () => withUser((s, u) => fetchCompanyMemberships(s, u)),
  });
}

export function useEditableCompany(companyId: string | null) {
  return useQuery({
    queryKey: crudKeys.editableCompany(companyId ?? "none"),
    queryFn: async () => {
      if (!companyId) return null;
      return withUser((s, u) => fetchEditableCompany(s, u, companyId));
    },
    enabled: Boolean(companyId),
  });
}

export function useCompanyActiveJobs(companyId: string | null) {
  return useQuery({
    queryKey: ["company", "jobs", companyId ?? "none"],
    queryFn: async () => {
      if (!companyId) return [];
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("jobs")
        .select("id, slug, title, location, salary_display, remote, published_at")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(companyId),
  });
}

export function useCompanyJobsForRecruiter(companyId: string | null) {
  return useQuery({
    queryKey: ["company", "jobs", "recruiter", companyId ?? "none"],
    queryFn: async () => {
      if (!companyId) return [];
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, slug, title, location, salary_display, remote, is_active, application_mode, published_at"
        )
        .eq("company_id", companyId)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(companyId),
  });
}
