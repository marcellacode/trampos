"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useCompanyJobsForRecruiter, useCompanyMemberships } from "@/lib/crud/hooks";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { cn } from "@/lib/utils";

function shellLayoutProps(shell: ReturnType<typeof useDashboardShell>["shell"]) {
  return {
    user: shell.user,
    notifications: shell.notifications,
    unreadNotifications: shell.unreadNotifications,
    unreadMessages: shell.unreadMessages,
  };
}

export function EmpresaVagasPage() {
  const { shell } = useDashboardShell();
  const membershipsQuery = useCompanyMemberships();
  const memberships = membershipsQuery.data ?? [];
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCompanyId && memberships.length > 0) {
      setSelectedCompanyId(memberships[0].companyId);
    }
  }, [memberships, selectedCompanyId]);

  const jobsQuery = useCompanyJobsForRecruiter(selectedCompanyId);
  const selectedMembership = memberships.find(
    (item) => item.companyId === selectedCompanyId
  );

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
          <h1 className="text-xl font-semibold text-foreground">Vagas da empresa</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Reivindique uma empresa em{" "}
            <Link href="/dashboard/empresa" className="text-primary hover:underline">
              Minha empresa
            </Link>{" "}
            para publicar vagas internas.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const jobs = jobsQuery.data ?? [];

  return (
    <DashboardLayout {...shellLayoutProps(shell)}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/dashboard/empresa"
              className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Minha empresa
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Vagas publicadas
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Crie e edite vagas internas que aparecem no discovery e na página
              pública da empresa.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              href="/dashboard/empresa/candidatos"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver candidatos
            </Link>
            {memberships.length > 1 ? (
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">Empresa</span>
                <select
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={selectedCompanyId ?? ""}
                  onChange={(event) => setSelectedCompanyId(event.target.value)}
                >
                  {memberships.map((membership) => (
                    <option key={membership.id} value={membership.companyId}>
                      {membership.company.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {selectedCompanyId ? (
              <Button
                render={
                  <Link
                    href={`/dashboard/empresa/vagas/nova?company=${selectedCompanyId}`}
                  />
                }
                nativeButton={false}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Nova vaga
              </Button>
            ) : null}
          </div>
        </div>

        {jobsQuery.isLoading ? (
          <div className="rounded-2xl border border-border bg-card/60 p-8 text-sm text-muted-foreground">
            Carregando vagas…
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma vaga publicada ainda.
            </p>
            {selectedCompanyId ? (
              <Button
                className="mt-4 gap-1.5"
                render={
                  <Link
                    href={`/dashboard/empresa/vagas/nova?company=${selectedCompanyId}`}
                  />
                }
                nativeButton={false}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Publicar primeira vaga
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Vaga</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">
                    Local
                  </th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">
                    Modo
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{job.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                        {job.location}
                      </p>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {job.location}
                      {job.remote ? " · Remoto" : ""}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {job.application_mode === "external_redirect"
                        ? "Redirect externo"
                        : "Plataforma"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          job.is_active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {job.is_active ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/empresa/vagas/${job.id}?company=${selectedCompanyId}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedMembership ? (
          <p className="text-xs text-muted-foreground">
            Vagas ativas também aparecem em{" "}
            <Link
              href={`/empresa/${selectedMembership.company.slug}`}
              className="text-primary hover:underline"
            >
              /empresa/{selectedMembership.company.slug}
            </Link>
            .
          </p>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
