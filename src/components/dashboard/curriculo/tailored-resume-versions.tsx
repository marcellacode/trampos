"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, RefreshCw } from "lucide-react";
import {
  listTailoredResumeVersionsAction,
  type TailoredResumeVersion,
} from "@/app/actions/resume";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/applications/hooks";

export function TailoredResumeVersions() {
  const [versions, setVersions] = useState<TailoredResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    void listTailoredResumeVersionsAction().then((result) => {
      setLoading(false);
      if (result.success) setVersions(result.data);
    });
  }, []);

  async function handleCopy(id: string, text: string) {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Versões por vaga</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Currículos adaptados pela IA para cada candidatura preparada.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            void listTailoredResumeVersionsAction().then((result) => {
              setLoading(false);
              if (result.success) setVersions(result.data);
            });
          }}
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Atualizar
        </Button>
      </div>

      {loading && (
        <p className="mt-6 text-sm text-muted-foreground">Carregando versões...</p>
      )}

      {!loading && versions.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          Nenhum currículo adaptado ainda. Prepare uma candidatura em uma vaga para
          gerar a primeira versão.
        </p>
      )}

      <ul className="mt-4 space-y-3" role="list">
        {versions.map((version) => {
          const expanded = expandedId === version.id;
          return (
            <li
              key={version.id}
              className="rounded-xl border border-border bg-muted/30 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{version.roleTitle}</p>
                  {version.companyName && (
                    <p className="text-xs text-muted-foreground">{version.companyName}</p>
                  )}
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[#6B7280]">
                    {version.submissionStatus.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {version.jobRef && (
                    <Button
                      render={<Link href={`/dashboard/vagas/${version.jobRef}`} />}
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Ver vaga
                    </Button>
                  )}
                  {version.tailoredResumeText && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExpandedId(expanded ? null : version.id)
                      }
                    >
                      <FileText className="mr-1.5 h-3.5 w-3.5" />
                      {expanded ? "Ocultar" : "Ver currículo"}
                    </Button>
                  )}
                </div>
              </div>

              {expanded && version.tailoredResumeText && (
                <div className="mt-4 space-y-3">
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-black/20 p-4 text-xs leading-relaxed text-foreground/90">
                    {version.tailoredResumeText}
                  </pre>
                  <Button
                    size="sm"
                    onClick={() =>
                      void handleCopy(version.id, version.tailoredResumeText ?? "")
                    }
                  >
                    {copiedId === version.id ? "Copiado!" : "Copiar currículo"}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
