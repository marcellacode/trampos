"use client";

import {
  Gift,
  ListChecks,
  Sparkles,
  Star,
  Target,
  Wrench,
} from "lucide-react";
import {
  ReportCard,
  ReportSectionHeader,
} from "@/components/dashboard/jobs/details/report-card";
import type { JobSections as JobSectionsType } from "@/types/jobs";

interface JobSectionsProps {
  sections: JobSectionsType;
  stack: string[];
}

const SECTION_CONFIG = [
  {
    key: "summary" as const,
    title: "Resumo",
    icon: Sparkles,
    accent: "#4F7CFF",
  },
  {
    key: "responsibilities" as const,
    title: "Responsabilidades",
    icon: Target,
    accent: "#8B5CF6",
  },
  {
    key: "requirements" as const,
    title: "Requisitos",
    icon: ListChecks,
    accent: "#22C55E",
  },
  {
    key: "differentials" as const,
    title: "Diferenciais",
    icon: Star,
    accent: "#F59E0B",
  },
  {
    key: "benefits" as const,
    title: "Benefícios",
    icon: Gift,
    accent: "#EC4899",
  },
];

export function JobSections({ sections, stack }: JobSectionsProps) {
  return (
    <div className="space-y-4">
      <ReportSectionHeader
        title="Descrição da vaga"
        subtitle="Organizada em blocos para leitura rápida — nunca texto corrido"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTION_CONFIG.map(({ key, title, icon: Icon, accent }) => (
          <ReportCard key={key} className="p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${accent}18`, color: accent }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
            </div>
            <ul className="space-y-2" role="list">
              {sections[key].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-white/85"
                >
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </ReportCard>
        ))}

        <ReportCard className="p-5 sm:col-span-2">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F7CFF]/15 text-[#4F7CFF]">
              <Wrench className="h-4 w-4" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-white">Tecnologias</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {stack.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-[#4F7CFF]/30 hover:bg-[#4F7CFF]/5"
              >
                {tech}
              </span>
            ))}
          </div>
        </ReportCard>
      </div>
    </div>
  );
}
