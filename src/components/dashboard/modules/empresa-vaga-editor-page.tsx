"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCompanyJobForEditAction } from "@/app/actions/company-jobs";
import type { RecruiterJobFormData } from "@/app/actions/company-jobs";
import { CompanyJobForm } from "@/components/company/company-job-form";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useCompanyMemberships } from "@/lib/crud/hooks";
import { useDashboardShell } from "@/lib/dashboard/hooks";

function shellLayoutProps(shell: ReturnType<typeof useDashboardShell>["shell"]) {
  return {
    user: shell.user,
    notifications: shell.notifications,
    unreadNotifications: shell.unreadNotifications,
    unreadMessages: shell.unreadMessages,
  };
}

interface EmpresaVagaEditorPageProps {
  jobId?: string;
}

export function EmpresaVagaEditorPage({ jobId }: EmpresaVagaEditorPageProps) {
  const { shell } = useDashboardShell();
  const searchParams = useSearchParams();
  const companyIdFromQuery = searchParams.get("company");
  const membershipsQuery = useCompanyMemberships();
  const memberships = membershipsQuery.data ?? [];
  const [initial, setInitial] = useState<RecruiterJobFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingJob, setLoadingJob] = useState(Boolean(jobId));

  const companyId = companyIdFromQuery ?? memberships[0]?.companyId ?? null;

  useEffect(() => {
    if (!jobId || !companyId) {
      setLoadingJob(false);
      return;
    }

    let cancelled = false;
    setLoadingJob(true);
    void getCompanyJobForEditAction(companyId, jobId).then((result) => {
      if (cancelled) return;
      if (!result.success) {
        setLoadError(result.error);
      } else {
        setInitial(result.data);
      }
      setLoadingJob(false);
    });

    return () => {
      cancelled = true;
    };
  }, [jobId, companyId]);

  const isEditing = Boolean(jobId);
  const canEdit = memberships.some(
    (item) => item.companyId === companyId && ["admin", "recruiter"].includes(item.role)
  );

  if (membershipsQuery.isLoading || loadingJob) {
    return (
      <DashboardLayout {...shellLayoutProps(shell)}>
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
          Carregando…
        </div>
      </DashboardLayout>
    );
  }

  if (!companyId || !canEdit) {
    return (
      <DashboardLayout {...shellLayoutProps(shell)}>
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Sem permissão para gerenciar vagas desta empresa.
          </p>
          <Link
            href="/dashboard/empresa/vagas"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Voltar
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (isEditing && loadError) {
    return (
      <DashboardLayout {...shellLayoutProps(shell)}>
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <p className="text-sm text-destructive">{loadError}</p>
          <Link
            href="/dashboard/empresa/vagas"
            className="mt-4 inline-block text-sm text-primary hover:underline"
          >
            Voltar
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (isEditing && !initial) {
    return (
      <DashboardLayout {...shellLayoutProps(shell)}>
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Vaga não encontrada.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout {...shellLayoutProps(shell)}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link
            href="/dashboard/empresa/vagas"
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Vagas publicadas
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isEditing ? "Editar vaga" : "Nova vaga"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Publique vagas internas visíveis no discovery e na página pública da
            empresa.
          </p>
        </div>

        <CompanyJobForm
          companyId={companyId}
          initial={initial ?? undefined}
          cancelHref="/dashboard/empresa/vagas"
        />
      </div>
    </DashboardLayout>
  );
}
