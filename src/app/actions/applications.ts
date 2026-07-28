"use server";

import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import {
  confirmExternalApplication,
  prepareApplication,
} from "@/lib/integrations/ats/application-service";
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
