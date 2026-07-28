"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  ApplySidebar,
  CareerImpactSection,
  CompanyAnalysis,
  CultureRadar,
  GithubProjects,
  HiringTimeline,
  InterviewQuestions,
  JobComparisonSection,
  JobFAQSection,
  JobHero,
  JobSections,
  MobileApplySheet,
  PortfolioHighlights,
  RelatedJobs,
  ResumeSuggestions,
  SalaryComparison,
  SimilarCompanies,
  StudyTopics,
  TeamInfoSection,
  TechComparison,
  WhyMatch,
} from "@/components/dashboard/jobs/details";
import { JobDetailsSkeleton } from "@/components/dashboard/jobs/details/job-details-skeleton";
import { JobeChat } from "@/components/dashboard/jobe-chat";
import { Button } from "@/components/ui/button";
import { useJobApplication } from "@/lib/applications/hooks";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { useJob } from "@/lib/jobs/hooks";
import {
  listSavedJobRefsAction,
  saveJobAction,
  unsaveJobAction,
} from "@/app/actions/discovery";
import type { JobDetail } from "@/types/jobs";

interface JobDetailsPageProps {
  jobId: string;
}

function JobDetailsContent({ job }: { job: JobDetail }) {
  const [saved, setSaved] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const apply = useJobApplication({ job });

  useEffect(() => {
    void listSavedJobRefsAction().then((result) => {
      if (result.success) setSaved(result.data.includes(job.id));
    });
  }, [job.id]);

  async function handleSave() {
    const isSaved = saved;
    setSaved(!isSaved);
    if (isSaved) {
      await unsaveJobAction(job.id);
    } else {
      await saveJobAction(job.id, job);
    }
  }

  function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      void navigator.share({
        title: job.role,
        text: `Confira esta vaga: ${job.role} na ${job.company}`,
        url: window.location.href,
      });
    }
  }

  async function handleHeroPrepare() {
    if (apply.state === "prepared" && apply.applyUrl) {
      apply.openExternalApply();
      return;
    }
    if (apply.state === "idle") {
      await apply.prepare();
    }
  }

  const isExternal = job.source === "adzuna";

  if (isExternal) {
    return (
      <div className="space-y-6 pb-24 lg:pb-8">
        <JobHero
          job={job}
          saved={saved}
          onSave={() => void handleSave()}
          onShare={handleShare}
          isExternal
          onPrepare={() => void handleHeroPrepare()}
          prepareLabel={apply.buttonLabel}
          prepareLoading={apply.isLoading}
          prepareDisabled={apply.isDone}
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="rounded-2xl border border-white/[0.08] bg-[#111315] p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Descrição
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/90">
              {job.description || job.aiSummary || "Descrição não disponível."}
            </p>
          </div>
          <ApplySidebar job={job} className="hidden lg:block" />
        </div>
        <MobileApplySheet
          job={job}
          open={sheetOpen}
          onToggle={() => setSheetOpen((v) => !v)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-24 lg:pb-8">
        <JobHero
          job={job}
          saved={saved}
          onSave={() => void handleSave()}
          onShare={handleShare}
          onPrepare={() => void handleHeroPrepare()}
          prepareLabel={apply.buttonLabel}
          prepareLoading={apply.isLoading}
          prepareDisabled={apply.isDone}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="min-w-0 space-y-6">
            <WhyMatch job={job} />
            <CareerImpactSection data={job.careerImpact} />
            <JobSections sections={job.sections} stack={job.stack} />
            <TechComparison data={job.techComparison} />
            <StudyTopics data={job.studyPlan} />
            <CompanyAnalysis
              company={job.company}
              logo={job.logo}
              color={job.color}
              profile={job.companyProfile}
              stats={job.stats}
            />
            <TeamInfoSection data={job.teamInfo} />
            <div className="grid gap-6 lg:grid-cols-2">
              <CultureRadar data={job.culture} />
              <SalaryComparison data={job.salaryComparison} />
            </div>
            <HiringTimeline stages={job.hiringTimeline} />
            <JobFAQSection faqs={job.faqs} />
            <InterviewQuestions questions={job.interviewQuestions} />
            <GithubProjects projects={job.githubProjects} />
            <div className="grid gap-6 lg:grid-cols-2">
              <ResumeSuggestions suggestions={job.resumeSuggestions} />
              <PortfolioHighlights projects={job.portfolioProjects} />
            </div>
            <SimilarCompanies companies={job.similarCompanies} />
            <JobComparisonSection data={job.comparison} />
            <RelatedJobs jobs={job.relatedJobs} />
          </div>

          <ApplySidebar job={job} className="hidden lg:block" />
        </div>
      </div>

      <MobileApplySheet
        job={job}
        open={sheetOpen}
        onToggle={() => setSheetOpen((v) => !v)}
      />
    </>
  );
}

export function JobDetailsPage({ jobId }: JobDetailsPageProps) {
  const { data: job, isLoading, isError, refetch } = useJob(jobId);
  const { shell } = useDashboardShell();

  return (
    <DashboardLayout
      user={shell.user}
      notifications={shell.notifications}
      unreadNotifications={shell.unreadNotifications}
      unreadMessages={shell.unreadMessages}
      contentClassName="max-w-[1400px]"
      chatContext="job_detail"
      chatPanel={({ open, onClose }) => (
        <JobeChat
          open={open}
          onClose={onClose}
          userId={shell.user.id}
          userName={shell.user.firstName}
          context="job_detail"
          className="xl:fixed xl:inset-y-0 xl:right-0 xl:w-[340px]"
        />
      )}
    >
      {isLoading && <JobDetailsSkeleton />}

      {isError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-16 text-center">
          <AlertCircle
            className="mb-4 h-10 w-10 text-[#EF4444]"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold text-white">
            Erro ao carregar o dossiê
          </h2>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Não conseguimos gerar o relatório desta vaga. Tente novamente.
          </p>
          <Button onClick={() => refetch()} className="mt-6 gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && !job && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-white">
            Vaga não encontrada
          </h2>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            O dossiê desta oportunidade ainda não está disponível.
          </p>
          <Button
            render={<Link href="/dashboard/vagas" />}
            nativeButton={false}
            className="mt-6"
          >
            Voltar para vagas
          </Button>
        </div>
      )}

      {job && <JobDetailsContent job={job} />}
    </DashboardLayout>
  );
}
