"use client";

import Link from "next/link";
import { MessageSquareQuote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { InterviewQuestion } from "@/types/jobs";

interface InterviewQuestionsProps {
  questions: InterviewQuestion[];
  jobId?: string;
  roleTitle?: string;
  companyName?: string;
}

function buildInterviewHref(
  jobId?: string,
  roleTitle?: string,
  companyName?: string
): string {
  const params = new URLSearchParams();
  if (jobId) params.set("jobId", jobId);
  if (roleTitle) params.set("role", roleTitle);
  if (companyName) params.set("company", companyName);
  const query = params.toString();
  return query ? `/dashboard/entrevistas?${query}` : "/dashboard/entrevistas";
}

export function InterviewQuestions({
  questions,
  jobId,
  roleTitle,
  companyName,
}: InterviewQuestionsProps) {
  const trainHref = buildInterviewHref(jobId, roleTitle, companyName);

  return (
    <ReportCard glow>
      <ReportSectionHeader
        title="Entrevistas"
        subtitle="Perguntas reais reportadas por candidatos que passaram pelo processo"
      />

      <div className="space-y-3">
        {questions.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-border bg-muted/30 p-4 transition-colors hover:border-primary/20"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {q.tech}
              </span>
            </div>
            <p className="flex items-start gap-2 text-sm text-foreground/90">
              <MessageSquareQuote
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              {q.question}
            </p>
          </div>
        ))}
      </div>

      <Button
        render={<Link href={trainHref} />}
        nativeButton={false}
        variant="outline"
        className="mt-5 h-10 w-full gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Treinar entrevista
      </Button>
    </ReportCard>
  );
}
