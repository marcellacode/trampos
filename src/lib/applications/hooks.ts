"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyInternalJobAction,
  confirmExternalApplicationAction,
  getInternalApplicationAction,
  prepareJobApplicationAction,
} from "@/app/actions/applications";
import type { JobRecommendation } from "@/types/jobs";
import {
  getApplyButtonLabel,
  isPlatformApply,
  usesExternalApply,
} from "@/lib/jobs/source-utils";

export type ApplicationUiState = "idle" | "preparing" | "prepared" | "completed";

interface UseJobApplicationOptions {
  job: Pick<
    JobRecommendation,
    | "id"
    | "companyId"
    | "company"
    | "role"
    | "externalUrl"
    | "source"
    | "applicationMode"
    | "location"
    | "salary"
    | "salaryMin"
    | "salaryMax"
    | "compatibility"
    | "hasMatch"
    | "approvalProbability"
    | "bestSendTime"
    | "logo"
    | "color"
    | "href"
    | "stack"
    | "reasons"
    | "stats"
    | "remote"
    | "aiSummary"
    | "description"
  >;
}

export function useJobApplication({ job }: UseJobApplicationOptions) {
  const [state, setState] = useState<ApplicationUiState>("idle");
  const [applyUrl, setApplyUrl] = useState<string | null>(job.externalUrl ?? null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [tailoredResumeText, setTailoredResumeText] = useState<string | null>(null);
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const isExternal = usesExternalApply(job);
  const isInternalPlatform = isPlatformApply(job);

  useEffect(() => {
    if (!isInternalPlatform || hydrated) return;

    void getInternalApplicationAction(job.id).then((result) => {
      setHydrated(true);
      if (!result.success || !result.data) return;

      if (result.data.submissionStatus === "completed") {
        setApplicationId(result.data.applicationId);
        setTailoredResumeText(result.data.tailoredResumeText);
        setCoverLetterText(result.data.coverLetterText);
        setState("completed");
      }
    });
  }, [isInternalPlatform, hydrated, job.id]);

  const prepare = useCallback(async () => {
    setState("preparing");
    setError(null);

    const action = isInternalPlatform
      ? applyInternalJobAction
      : prepareJobApplicationAction;

    const result = await action(job as JobRecommendation);
    if (!result.success) {
      setState("idle");
      setError(result.error);
      return false;
    }

    setApplyUrl(result.data.applyUrl);
    setApplicationId(result.data.applicationId);
    setTailoredResumeText(result.data.tailoredResumeText);
    setCoverLetterText(result.data.coverLetterText);
    setState(
      result.data.submissionStatus === "completed" ? "completed" : "prepared"
    );
    return true;
  }, [isInternalPlatform, job]);

  const confirmExternal = useCallback(async () => {
    if (!applicationId) return false;
    const result = await confirmExternalApplicationAction(applicationId);
    if (!result.success) {
      setError(result.error);
      return false;
    }
    setState("completed");
    return true;
  }, [applicationId]);

  const openExternalApply = useCallback(() => {
    if (!applyUrl) return;
    window.open(applyUrl, "_blank", "noopener,noreferrer");
  }, [applyUrl]);

  const buttonLabel = getApplyButtonLabel(state, {
    applyUrl,
    usesExternalApply: isExternal,
    applicationMode: job.applicationMode,
  });

  return {
    state,
    isExternal,
    isInternalPlatform,
    applyUrl,
    applicationId,
    tailoredResumeText,
    coverLetterText,
    error,
    buttonLabel,
    prepare,
    confirmExternal,
    openExternalApply,
    isLoading: state === "preparing",
    isDone: state === "completed",
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
