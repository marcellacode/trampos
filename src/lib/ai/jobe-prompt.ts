import type { ExtractedProfile } from "@/types/onboarding";

export const JOBE_SYSTEM_PROMPT = `Você é Jobe, assistente de carreira da Jobera — uma plataforma que ajuda profissionais a encontrar vagas, adaptar currículos e evoluir na carreira.

Personalidade e tom:
- Profissional, acolhedor e direto
- Sempre responda em português brasileiro
- Use linguagem clara, sem jargão desnecessário
- Seja proativo, mas honesto sobre limitações

Contexto de atuação:
- Vagas de emprego e compatibilidade com o perfil do usuário
- Currículo, portfólio e empregabilidade
- Metas de carreira, salário e modelo de trabalho
- Preparação para entrevistas

Regras importantes:
- NUNCA invente experiências, formações ou habilidades do usuário
- Baseie respostas no perfil fornecido quando disponível
- Se faltar informação, diga o que precisa saber em vez de assumir
- Não prometa emprego garantido ou resultados específicos
- Respostas concisas (2–4 parágrafos no máximo, salvo quando pedirem detalhes)`;

interface JobSummary {
  title: string;
  company?: string;
  location?: string;
  remote?: boolean;
  compatibility?: number;
}

export function buildJobeContext(
  profile: ExtractedProfile | null,
  jobs?: JobSummary[]
): string {
  const sections: string[] = [];

  if (profile?.name) {
    sections.push(
      [
        "## Perfil do usuário",
        `Nome: ${profile.name}`,
        profile.currentRole ? `Cargo atual: ${profile.currentRole}` : "",
        profile.seniority ? `Senioridade: ${profile.seniority}` : "",
        profile.summary ? `Resumo: ${profile.summary}` : "",
        profile.skills.length > 0
          ? `Habilidades: ${profile.skills.slice(0, 15).join(", ")}`
          : "",
        profile.experiences.length > 0
          ? `Experiências recentes: ${profile.experiences
              .slice(0, 3)
              .map((e) => `${e.role} @ ${e.company}`)
              .join("; ")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  if (jobs && jobs.length > 0) {
    sections.push(
      [
        "## Vagas relevantes",
        ...jobs.slice(0, 8).map((job) => {
          const parts = [`- ${job.title}`];
          if (job.company) parts.push(`(${job.company})`);
          if (job.location) parts.push(`— ${job.location}`);
          if (job.remote) parts.push("[remoto]");
          if (job.compatibility != null) parts.push(`— ${job.compatibility}% compatível`);
          return parts.join(" ");
        }),
      ].join("\n")
    );
  }

  if (sections.length === 0) {
    return "Nenhum dado de perfil disponível ainda. Responda de forma genérica sobre carreira e vagas.";
  }

  return sections.join("\n\n");
}
