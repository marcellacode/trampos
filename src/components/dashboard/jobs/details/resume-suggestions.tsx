"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { regenerateTailoredResumeAction } from "@/app/actions/resume";
import { Button } from "@/components/ui/button";
import {
  AIBadge,
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { JobRecommendation, ResumeSuggestion } from "@/types/jobs";
import { cn } from "@/lib/utils";
import { ArrowRight, FileText, Plus } from "lucide-react";

interface ResumeSuggestionsProps {
  suggestions: ResumeSuggestion[];
  job: Pick<JobRecommendation, "id" | "role" | "company" | "description" | "stack" | "companyId" | "externalUrl" | "source">;
  onSuggestionsUpdated?: (suggestions: ResumeSuggestion[]) => void;
}

const TYPE_CONFIG = {
  add: { icon: Plus, label: "Adicionar", color: "#22C55E" },
  move: { icon: ArrowRight, label: "Mover", color: "#4F7CFF" },
  highlight: { icon: Sparkles, label: "Destacar", color: "#F59E0B" },
};

export function ResumeSuggestions({
  suggestions: initialSuggestions,
  job,
  onSuggestionsUpdated,
}: ResumeSuggestionsProps) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSuggestions(initialSuggestions);
  }, [initialSuggestions]);

  async function handleRegenerate() {
    setLoading(true);
    setError(null);
    const result = await regenerateTailoredResumeAction(job as JobRecommendation);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSuggestions(result.data.suggestions);
    onSuggestionsUpdated?.(result.data.suggestions);
  }

  return (
    <ReportCard>
      <ReportSectionHeader
        title="Currículo"
        subtitle="Antes de enviar, a IA sugere estes ajustes"
        badge={<AIBadge />}
      />

      {suggestions.length === 0 && !loading && (
        <p className="text-sm text-[#9CA3AF]">
          Gere adaptações personalizadas para ver sugestões específicas desta vaga.
        </p>
      )}

      <ul className="space-y-2.5" role="list">
        {suggestions.map((s) => {
          const config = TYPE_CONFIG[s.type];
          const Icon = config.icon;
          return (
            <li
              key={s.id}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                )}
                style={{
                  backgroundColor: `${config.color}18`,
                  color: config.color,
                }}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  {config.label}
                </p>
                <p className="mt-0.5 text-sm text-white/90">{s.text}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {error && <p className="mt-3 text-xs text-[#EF4444]">{error}</p>}

      <Button
        className="mt-5 h-10 w-full gap-2"
        disabled={loading}
        onClick={() => void handleRegenerate()}
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            Gerando adaptação...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" aria-hidden="true" />
            {suggestions.length > 0 ? "Regenerar adaptação" : "Gerar adaptação com IA"}
          </>
        )}
      </Button>
    </ReportCard>
  );
}
