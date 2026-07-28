"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Save } from "lucide-react";
import {
  updateCompanyBenefitsAction,
  updateCompanyProfileAction,
} from "@/app/actions/company";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CompanyJobsList } from "@/components/company/company-jobs-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCompanyActiveJobs,
  useCompanyMemberships,
  useEditableCompany,
} from "@/lib/crud/hooks";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import type { EditableCompany, PublicCompanyJob } from "@/types/company";

function mapDashboardJobs(
  jobs: {
    id: string;
    slug: string;
    title: string;
    location: string;
    salary_display: string;
    remote: boolean;
  }[]
): PublicCompanyJob[] {
  return jobs.map((job) => ({
    id: job.id,
    slug: job.slug,
    title: job.title,
    location: job.location,
    salary: job.salary_display,
    remote: job.remote,
    href: `/dashboard/vagas/${job.slug || job.id}`,
  }));
}

export function EmpresaDashboardPage() {
  const { shell } = useDashboardShell();
  const membershipsQuery = useCompanyMemberships();
  const memberships = membershipsQuery.data ?? [];
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCompanyId && memberships.length > 0) {
      setSelectedCompanyId(memberships[0].companyId);
    }
  }, [memberships, selectedCompanyId]);

  const editableQuery = useEditableCompany(selectedCompanyId);
  const jobsQuery = useCompanyActiveJobs(selectedCompanyId);
  const company = editableQuery.data;

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
          <h1 className="text-xl font-semibold text-foreground">Minha empresa</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Você ainda não é membro de nenhuma empresa. Reivindique uma página
            pública em{" "}
            <Link href="/empresa/nubank" className="text-primary hover:underline">
              /empresa/[slug]
            </Link>{" "}
            com seu e-mail corporativo.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const selectedMembership = memberships.find(
    (item) => item.companyId === selectedCompanyId
  );

  return (
    <DashboardLayout {...shellLayoutProps(shell)}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Minha empresa
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Edite o perfil público, benefícios e acompanhe vagas ativas.
            </p>
          </div>

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
        </div>

        {editableQuery.isLoading || !company ? (
          <div className="rounded-2xl border border-border bg-card/60 p-8 text-sm text-muted-foreground">
            Carregando dados da empresa…
          </div>
        ) : (
          <>
            <CompanyEditor company={company} />
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Vagas ativas</h2>
              {selectedMembership ? (
                <Link
                  href={`/empresa/${selectedMembership.company.slug}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Ver página pública
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <CompanyJobsList
              jobs={mapDashboardJobs(jobsQuery.data ?? [])}
              companyName={company.name}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function shellLayoutProps(shell: ReturnType<typeof useDashboardShell>["shell"]) {
  return {
    user: shell.user,
    notifications: shell.notifications,
    unreadNotifications: shell.unreadNotifications,
    unreadMessages: shell.unreadMessages,
  };
}

function CompanyEditor({ company }: { company: EditableCompany }) {
  const [bio, setBio] = useState(company.bio);
  const [logo, setLogo] = useState(company.logo);
  const [coverUrl, setCoverUrl] = useState(company.coverUrl ?? "");
  const [benefitsText, setBenefitsText] = useState(company.benefits.join("\n"));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setBio(company.bio);
    setLogo(company.logo);
    setCoverUrl(company.coverUrl ?? "");
    setBenefitsText(company.benefits.join("\n"));
  }, [company]);

  return (
    <form
      className="space-y-6 rounded-2xl border border-border bg-card/60 p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        setError(null);
        startTransition(async () => {
          const profileResult = await updateCompanyProfileAction({
            companyId: company.id,
            bio,
            logo,
            coverUrl: coverUrl.trim() || null,
          });
          if (!profileResult.success) {
            setError(profileResult.error);
            return;
          }

          const benefitsResult = await updateCompanyBenefitsAction({
            companyId: company.id,
            benefits: benefitsText.split("\n"),
          });
          if (!benefitsResult.success) {
            setError(benefitsResult.error);
            return;
          }

          setMessage("Alterações salvas.");
        });
      }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{company.name}</h2>
          <p className="text-sm text-muted-foreground">{company.segment}</p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          Papel: {company.role}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company-logo">Logo (sigla)</Label>
          <Input
            id="company-logo"
            value={logo}
            maxLength={4}
            onChange={(event) => setLogo(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-cover">URL da capa</Label>
          <Input
            id="company-cover"
            value={coverUrl}
            placeholder="https://…"
            onChange={(event) => setCoverUrl(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-bio">Bio</Label>
        <textarea
          id="company-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={5}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Conte a história e cultura da empresa…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-benefits">Benefícios (um por linha)</Label>
        <textarea
          id="company-benefits"
          value={benefitsText}
          onChange={(event) => setBenefitsText(event.target.value)}
          rows={6}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder={"Plano de saúde\nStock options\nAuxílio home office"}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="text-sm text-emerald-500">{message}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Salvando…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" aria-hidden="true" />
            Salvar alterações
          </>
        )}
      </Button>
    </form>
  );
}
