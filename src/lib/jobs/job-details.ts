import type { JobDetail } from "@/types/jobs";
import { MOCK_JOB_DETAIL } from "@/lib/jobs/mock-job-detail";

export function getJobDetail(id: string): JobDetail | undefined {
  if (!id) return undefined;
  return { ...MOCK_JOB_DETAIL, id, href: `/dashboard/vagas/${id}` };
}

export function getAllJobIds(): string[] {
  return [MOCK_JOB_DETAIL.id];
}
