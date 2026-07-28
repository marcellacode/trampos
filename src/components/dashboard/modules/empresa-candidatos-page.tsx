"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, User } from "lucide-react";
import {
  listCompanyApplicationsAction,
  updateApplicationStatusAction,
} from "@/app/actions/applications";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  APPLICATION_STATUS_LABELS,
  RECRUITER_STATUS_OPTIONS,
  type ApplicationStatus,
} from "@/lib/applications/status-labels";
import { useCompanyJobsForRecruiter, useCompanyMemberships } from "@/lib/crud/hooks";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import type { CompanyJobApplicationRow } from "@/lib/supabase/queries/company-applications";
import { cn } from "@/lib/utils";

function shellLayoutProps(shell: ReturnType<typeof useDashboardShell>["shell"]) {
  return {
    user: shell.user,
    notifications: shell.notifications,
    unreadNotifications: shell.unreadNotifications,
    unreadMessages: shell.unreadMessages,
  };
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CandidateDetail({
  application,
  companyId,
  onStatusUpdated,
}: {
  application: CompanyJobApplicationRow;
  companyId: string;
  onStatusUpdated: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(next: ApplicationStatus) {
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await updateApplicationStatusAction({
        companyId,
        applicationId: application.id,
        status: next,
      });
      if (!result.success) {
        setError(result.error);
        setStatus(application.status);
        return;
      }
      onStatusUpdated();
    });
  }

  return (
    <article className="rounded-xl border border-border bg-card/60">
      <button
        type="button"
        className="flex w-full items-start gap-3 p-4 text-left"
        onClick={() => setExpanded((value) => !value)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{application.candidateName}</p>
          <p className="text-sm text-muted-foreground">{application.jobTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Candidatura em {formatDate(application.appliedAt)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            {APPLICATION_STATUS_LABELS[status]}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-border px-4 pb-4 pt-3">
          {application.candidateEmail ? (
            <p className="text-sm text-muted-foreground">{application.candidateEmail}</p>
          ) : null}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">Status do pipeline</span>
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={status}
              disabled={isPending}
              onChange={(event) =>
                handleStatusChange(event.target.value as ApplicationStatus)
              }
            >
              {RECRUITER_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {APPLICATION_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="text-xs text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {application.tailoredResumeText ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Currículo enviado
              </p>
              <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-black/20 p-3 font-sans text-xs text-muted-foreground">
                {application.tailoredResumeText}
              </pre>
            </div>
          ) : null}

          {application.coverLetterText ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Carta de apresentação
              </p>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-black/20 p-3 font-sans text-xs text-muted-foreground">
                {application.coverLetterText}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}

export function EmpresaCandidatosPage() {
  const { shell } = useDashboardShell();
  const membershipsQuery = useCompanyMemberships();
  const memberships = membershipsQuery.data ?? [];
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [applications, setApplications] = useState<CompanyJobApplicationRow[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCompanyId && memberships.length > 0) {
      setSelectedCompanyId(memberships[0].companyId);
    }
  }, [memberships, selectedCompanyId]);

  const jobsQuery = useCompanyJobsForRecruiter(selectedCompanyId);
  const internalJobs = (jobsQuery.data ?? []).filter(
    (job) => job.application_mode === "internal"
  );

  useEffect(() => {
    if (!selectedCompanyId) return;

    setLoadingApps(true);
    setLoadError(null);
    void listCompanyApplicationsAction(
      selectedCompanyId,
      selectedJobId || null
    ).then((result) => {
      setLoadingApps(false);
      if (!result.success) {
        setLoadError(result.error);
        setApplications([]);
        return;
      }
      setApplications(result.data);
    });
  }, [selectedCompanyId, selectedJobId]);

  if (membershipsQuery.isLoading) {
    return (
      <DashboardLayout {...shellLayoutProps(shell)}>
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Carregando…
        </div>
      </DashboardLayout>
    );
  }

  if (memberships.length === 0) {
    return (
      <DashboardLayout {...shellLayoutProps(shell)}>
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <h1 className="text-xl font-semibold text-foreground">Candidatos</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Reivindique uma empresa para ver candidaturas internas.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  function reloadApplications() {
    if (!selectedCompanyId) return;
    void listCompanyApplicationsAction(
      selectedCompanyId,
      selectedJobId || null
    ).then((result) => {
      if (result.success) setApplications(result.data);
    });
  }

  return (
    <DashboardLayout {...shellLayoutProps(shell)}>
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard/empresa"
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Minha empresa
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Candidatos
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Candidaturas internas das vagas da sua empresa.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          {memberships.length > 1 ? (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">Empresa</span>
              <select
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={selectedCompanyId ?? ""}
                onChange={(event) => {
                  setSelectedCompanyId(event.target.value);
                  setSelectedJobId("");
                }}
              >
                {memberships.map((membership) => (
                  <option key={membership.id} value={membership.companyId}>
                    {membership.company.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="flex flex-col gap-1.5 text-sm sm:min-w-[240px]">
            <span className="font-medium text-foreground">Filtrar por vaga</span>
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={selectedJobId}
              onChange={(event) => setSelectedJobId(event.target.value)}
            >
              <option value="">Todas as vagas internas</option>
              {internalJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loadError ? (
          <p className="text-sm text-red-400" role="alert">
            {loadError}
          </p>
        ) : null}

        {loadingApps ? (
          <div className="rounded-xl border border-border bg-card/60 p-8 text-sm text-muted-foreground">
            Carregando candidatos…
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma candidatura interna ainda.
            </p>
            <Button
              render={<Link href="/dashboard/empresa/vagas" />}
              nativeButton={false}
              variant="outline"
              className="mt-4"
            >
              Gerenciar vagas
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => (
              <CandidateDetail
                key={application.id}
                application={application}
                companyId={selectedCompanyId!}
                onStatusUpdated={reloadApplications}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
