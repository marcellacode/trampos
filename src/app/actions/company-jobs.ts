"use server";

import { revalidatePath } from "next/cache";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import type { ActionResult } from "@/app/actions/ai";
import { fetchEditableCompany } from "@/lib/supabase/queries/company";
import {
  createCompanyJob,
  fetchCompanyJobForEdit,
  updateCompanyJob,
  type CreateCompanyJobInput,
  type JobApplicationMode,
  type JobSectionsInput,
  type UpdateCompanyJobInput,
} from "@/lib/supabase/queries/mutations/company-jobs";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export interface CompanyJobFormInput {
  companyId: string;
  title: string;
  location: string;
  salaryDisplay: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  remote: boolean;
  applicationMode: JobApplicationMode;
  externalApplyUrl?: string | null;
  stack: string[];
  benefits: string[];
  sections: JobSectionsInput;
  isActive?: boolean;
}

export interface RecruiterJobFormData {
  id: string;
  slug: string;
  title: string;
  location: string;
  salaryDisplay: string;
  remote: boolean;
  isActive: boolean;
  applicationMode: JobApplicationMode;
  externalApplyUrl: string | null;
  stack: string[];
  benefits: string[];
  sections: JobSectionsInput;
}

function validateJobInput(input: CompanyJobFormInput): string | null {
  if (!input.title.trim()) return "Informe o título da vaga.";
  if (!input.location.trim()) return "Informe a localização.";
  if (!input.salaryDisplay.trim()) return "Informe a faixa salarial.";
  if (input.applicationMode === "external_redirect") {
    const url = input.externalApplyUrl?.trim();
    if (!url) return "Informe a URL externa de candidatura.";
    try {
      new URL(url);
    } catch {
      return "URL externa inválida.";
    }
  }
  return null;
}

async function assertCanEditCompany(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  userId: string,
  companyId: string
) {
  const editable = await fetchEditableCompany(supabase, userId, companyId);
  if (!editable) {
    throw new Error("Sem permissão para gerenciar vagas desta empresa.");
  }
  return editable;
}

export async function createCompanyJobAction(
  input: CompanyJobFormInput
): Promise<ActionResult<{ jobId: string; slug: string; companySlug: string }>> {
  try {
    const validationError = validateJobInput(input);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const { supabase, user } = await requireAuth();
    const editable = await assertCanEditCompany(supabase, user.id, input.companyId);

    const payload: CreateCompanyJobInput = {
      companyId: input.companyId,
      userId: user.id,
      title: input.title,
      location: input.location,
      salaryDisplay: input.salaryDisplay,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      remote: input.remote,
      applicationMode: input.applicationMode,
      externalApplyUrl: input.externalApplyUrl,
      stack: input.stack,
      benefits: input.benefits,
      sections: input.sections,
    };

    const job = await createCompanyJob(supabase, payload);

    revalidatePath("/dashboard/empresa");
    revalidatePath("/dashboard/empresa/vagas");
    revalidatePath("/dashboard/vagas");
    revalidatePath(`/empresa/${editable.slug}`);

    return {
      success: true,
      data: {
        jobId: job.id,
        slug: job.slug,
        companySlug: editable.slug,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updateCompanyJobAction(
  jobId: string,
  input: CompanyJobFormInput
): Promise<ActionResult<{ slug: string; companySlug: string }>> {
  try {
    const validationError = validateJobInput(input);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const { supabase, user } = await requireAuth();
    const editable = await assertCanEditCompany(supabase, user.id, input.companyId);

    const existing = await fetchCompanyJobForEdit(
      supabase,
      input.companyId,
      jobId
    );
    if (!existing) {
      return { success: false, error: "Vaga não encontrada." };
    }

    const payload: UpdateCompanyJobInput = {
      title: input.title,
      location: input.location,
      salaryDisplay: input.salaryDisplay,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      remote: input.remote,
      applicationMode: input.applicationMode,
      externalApplyUrl: input.externalApplyUrl,
      stack: input.stack,
      benefits: input.benefits,
      sections: input.sections,
      isActive: input.isActive ?? true,
    };

    const job = await updateCompanyJob(
      supabase,
      jobId,
      input.companyId,
      payload
    );

    revalidatePath("/dashboard/empresa");
    revalidatePath("/dashboard/empresa/vagas");
    revalidatePath("/dashboard/vagas");
    revalidatePath(`/dashboard/vagas/${job?.slug ?? jobId}`);
    revalidatePath(`/empresa/${editable.slug}`);

    return {
      success: true,
      data: {
        slug: job?.slug ?? existing.slug,
        companySlug: editable.slug,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function getCompanyJobForEditAction(
  companyId: string,
  jobId: string
): Promise<ActionResult<RecruiterJobFormData | null>> {
  try {
    const { supabase, user } = await requireAuth();
    await assertCanEditCompany(supabase, user.id, companyId);

    const job = await fetchCompanyJobForEdit(supabase, companyId, jobId);
    if (!job) return { success: true, data: null };

    const sections: JobSectionsInput = {
      summary: [],
      responsibilities: [],
      requirements: [],
      differentials: [],
    };

    for (const item of job.job_section_items ?? []) {
      const bucket = sections[item.section_type as keyof JobSectionsInput];
      if (bucket) bucket.push(item.content);
    }

    return {
      success: true,
      data: {
        id: job.id,
        slug: job.slug,
        title: job.title,
        location: job.location,
        salaryDisplay: job.salary_display,
        remote: job.remote,
        isActive: job.is_active,
        applicationMode: job.application_mode,
        externalApplyUrl: job.external_apply_url,
        stack: (job.job_stack ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item) => item.tech_name),
        benefits: (job.job_benefits ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item) => item.benefit),
        sections,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
