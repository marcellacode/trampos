"use server";

import { revalidatePath } from "next/cache";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import {
  applyInternalJob,
  confirmExternalApplication,
  prepareApplication,
} from "@/lib/integrations/ats/application-service";
import type { ApplicationStatus } from "@/lib/applications/status-labels";
import {
  fetchCompanyJobApplications,
  fetchUserInternalApplication,
  updateCompanyApplicationStatus,
} from "@/lib/supabase/queries/company-applications";
import type { JobRecommendation } from "@/types/jobs";
import type { ActionResult } from "@/app/actions/ai";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export interface PreparedApplicationResult {
  applicationId: string;
  applyUrl: string | null;
  submissionStatus: string;
  tailoredResumeText: string | null;
  coverLetterText: string | null;
  isExternal: boolean;
}

export async function prepareJobApplicationAction(
  job: JobRecommendation
): Promise<ActionResult<PreparedApplicationResult>> {
  try {
    const { supabase, user } = await requireAuth();
    const result = await prepareApplication(supabase, user.id, {
      jobRef: job.id,
      companyId: job.companyId || undefined,
      roleTitle: job.role,
      companyName: job.company,
      externalUrl: job.externalUrl,
      job,
    });

    return {
      success: true,
      data: {
        applicationId: result.application.id,
        applyUrl: result.applyUrl,
        submissionStatus: result.submissionStatus,
        tailoredResumeText: result.tailoredResumeText,
        coverLetterText: result.coverLetterText,
        isExternal: result.isExternal,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function bulkPrepareApplicationsAction(
  jobs: JobRecommendation[]
): Promise<ActionResult<{ results: PreparedApplicationResult[] }>> {
  try {
    const { supabase, user } = await requireAuth();
    const results: PreparedApplicationResult[] = [];

    for (const job of jobs) {
      const result = await prepareApplication(supabase, user.id, {
        jobRef: job.id,
        companyId: job.companyId || undefined,
        roleTitle: job.role,
        companyName: job.company,
        externalUrl: job.externalUrl,
        job,
      });
      results.push({
        applicationId: result.application.id,
        applyUrl: result.applyUrl,
        submissionStatus: result.submissionStatus,
        tailoredResumeText: result.tailoredResumeText,
        coverLetterText: result.coverLetterText,
        isExternal: result.isExternal,
      });
    }

    return { success: true, data: { results } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function confirmExternalApplicationAction(
  applicationId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireAuth();
    const row = await confirmExternalApplication(supabase, user.id, applicationId);
    return { success: true, data: { id: row.id } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function applyInternalJobAction(
  job: JobRecommendation
): Promise<ActionResult<PreparedApplicationResult>> {
  try {
    const { supabase, user } = await requireAuth();
    const result = await applyInternalJob(supabase, user.id, {
      jobId: job.id,
      job,
    });

    revalidatePath(`/dashboard/vagas/${job.id}`);
    revalidatePath("/dashboard/empresa/candidatos");

    return {
      success: true,
      data: {
        applicationId: result.application.id,
        applyUrl: null,
        submissionStatus: result.submissionStatus,
        tailoredResumeText: result.tailoredResumeText,
        coverLetterText: result.coverLetterText,
        isExternal: false,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getInternalApplicationAction(
  jobId: string
): Promise<
  ActionResult<{
    applicationId: string;
    submissionStatus: string;
    tailoredResumeText: string | null;
    coverLetterText: string | null;
  } | null>
> {
  try {
    const { supabase, user } = await requireAuth();
    const row = await fetchUserInternalApplication(supabase, user.id, jobId);
    if (!row) return { success: true, data: null };

    return {
      success: true,
      data: {
        applicationId: row.id,
        submissionStatus: row.submission_status,
        tailoredResumeText: row.tailored_resume_text,
        coverLetterText: row.cover_letter_text,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function listCompanyApplicationsAction(
  companyId: string,
  jobId?: string | null
): Promise<
  ActionResult<Awaited<ReturnType<typeof fetchCompanyJobApplications>>>
> {
  try {
    const { supabase, user } = await requireAuth();
    const rows = await fetchCompanyJobApplications(
      supabase,
      user.id,
      companyId,
      jobId
    );
    return { success: true, data: rows };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateApplicationStatusAction(input: {
  companyId: string;
  applicationId: string;
  status: ApplicationStatus;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireAuth();
    await updateCompanyApplicationStatus(
      supabase,
      user.id,
      input.companyId,
      input.applicationId,
      input.status
    );

    revalidatePath("/dashboard/empresa/candidatos");

    return { success: true, data: { id: input.applicationId } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
