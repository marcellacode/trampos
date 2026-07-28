"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import {
  createCompanyJobAction,
  updateCompanyJobAction,
  type CompanyJobFormInput,
  type RecruiterJobFormData,
} from "@/app/actions/company-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { JobApplicationMode } from "@/types/jobs";

const SECTION_FIELDS = [
  { key: "summary", label: "Resumo", placeholder: "Visão geral da vaga…" },
  {
    key: "responsibilities",
    label: "Responsabilidades",
    placeholder: "Uma responsabilidade por linha",
  },
  {
    key: "requirements",
    label: "Requisitos",
    placeholder: "Um requisito por linha",
  },
  {
    key: "differentials",
    label: "Diferenciais",
    placeholder: "Um diferencial por linha",
  },
] as const;

function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(values: string[]): string {
  return values.join("\n");
}

interface CompanyJobFormProps {
  companyId: string;
  initial?: RecruiterJobFormData;
  cancelHref: string;
}

export function CompanyJobForm({
  companyId,
  initial,
  cancelHref,
}: CompanyJobFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initial);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [salaryDisplay, setSalaryDisplay] = useState(initial?.salaryDisplay ?? "");
  const [remote, setRemote] = useState(initial?.remote ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [applicationMode, setApplicationMode] = useState<JobApplicationMode>(
    initial?.applicationMode ?? "internal"
  );
  const [externalApplyUrl, setExternalApplyUrl] = useState(
    initial?.externalApplyUrl ?? ""
  );
  const [stackText, setStackText] = useState(arrayToLines(initial?.stack ?? []));
  const [benefitsText, setBenefitsText] = useState(
    arrayToLines(initial?.benefits ?? [])
  );
  const [sectionsText, setSectionsText] = useState({
    summary: arrayToLines(initial?.sections.summary ?? []),
    responsibilities: arrayToLines(initial?.sections.responsibilities ?? []),
    requirements: arrayToLines(initial?.sections.requirements ?? []),
    differentials: arrayToLines(initial?.sections.differentials ?? []),
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!initial) return;
    setTitle(initial.title);
    setLocation(initial.location);
    setSalaryDisplay(initial.salaryDisplay);
    setRemote(initial.remote);
    setIsActive(initial.isActive);
    setApplicationMode(initial.applicationMode);
    setExternalApplyUrl(initial.externalApplyUrl ?? "");
    setStackText(arrayToLines(initial.stack));
    setBenefitsText(arrayToLines(initial.benefits));
    setSectionsText({
      summary: arrayToLines(initial.sections.summary),
      responsibilities: arrayToLines(initial.sections.responsibilities),
      requirements: arrayToLines(initial.sections.requirements),
      differentials: arrayToLines(initial.sections.differentials),
    });
  }, [initial]);

  function buildPayload(): CompanyJobFormInput {
    return {
      companyId,
      title,
      location,
      salaryDisplay,
      remote,
      applicationMode,
      externalApplyUrl:
        applicationMode === "external_redirect" ? externalApplyUrl : null,
      stack: linesToArray(stackText),
      benefits: linesToArray(benefitsText),
      sections: {
        summary: linesToArray(sectionsText.summary),
        responsibilities: linesToArray(sectionsText.responsibilities),
        requirements: linesToArray(sectionsText.requirements),
        differentials: linesToArray(sectionsText.differentials),
      },
      isActive,
    };
  }

  return (
    <form
      className="space-y-6 rounded-2xl border border-border bg-card/60 p-5 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
          const payload = buildPayload();
          const result = isEditing
            ? await updateCompanyJobAction(initial!.id, payload)
            : await createCompanyJobAction(payload);

          if (!result.success) {
            setError(result.error);
            return;
          }

          router.push("/dashboard/empresa/vagas");
          router.refresh();
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="job-title">Título</Label>
          <Input
            id="job-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Desenvolvedor(a) Frontend Sênior"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-location">Local</Label>
          <Input
            id="job-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="São Paulo, SP"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-salary">Salário (exibição)</Label>
          <Input
            id="job-salary"
            value={salaryDisplay}
            onChange={(event) => setSalaryDisplay(event.target.value)}
            placeholder="R$ 12.000 – R$ 18.000"
            required
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={remote}
            onChange={(event) => setRemote(event.target.checked)}
            className="rounded border-border"
          />
          Vaga remota
        </label>
        {isEditing ? (
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="rounded border-border"
            />
            Vaga ativa
          </label>
        ) : null}
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
        <p className="text-sm font-medium text-foreground">Modo de candidatura</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="application-mode"
              checked={applicationMode === "internal"}
              onChange={() => setApplicationMode("internal")}
            />
            Candidatura na plataforma Jobera
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="application-mode"
              checked={applicationMode === "external_redirect"}
              onChange={() => setApplicationMode("external_redirect")}
            />
            Redirecionar para site externo
          </label>
        </div>
        {applicationMode === "external_redirect" ? (
          <div className="space-y-2 pt-1">
            <Label htmlFor="job-external-url">URL externa de candidatura</Label>
            <Input
              id="job-external-url"
              type="url"
              value={externalApplyUrl}
              onChange={(event) => setExternalApplyUrl(event.target.value)}
              placeholder="https://empresa.com/vagas/123"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="job-stack">Stack (uma tecnologia por linha)</Label>
        <textarea
          id="job-stack"
          value={stackText}
          onChange={(event) => setStackText(event.target.value)}
          rows={4}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder={"React\nTypeScript\nNode.js"}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="job-benefits">Benefícios (um por linha)</Label>
        <textarea
          id="job-benefits"
          value={benefitsText}
          onChange={(event) => setBenefitsText(event.target.value)}
          rows={4}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder={"Plano de saúde\nStock options"}
        />
      </div>

      {SECTION_FIELDS.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={`job-section-${field.key}`}>{field.label}</Label>
          <textarea
            id={`job-section-${field.key}`}
            value={sectionsText[field.key]}
            onChange={(event) =>
              setSectionsText((current) => ({
                ...current,
                [field.key]: event.target.value,
              }))
            }
            rows={5}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder={field.placeholder}
          />
        </div>
      ))}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Salvando…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              {isEditing ? "Salvar vaga" : "Publicar vaga"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          render={<Link href={cancelHref} />}
          nativeButton={false}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
