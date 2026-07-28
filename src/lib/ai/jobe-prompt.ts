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
- NUNCA invente vagas — use apenas as listadas em "Vagas disponíveis"
- Baseie respostas no perfil fornecido quando disponível
- Se faltar informação, diga o que precisa saber em vez de assumir
- Não prometa emprego garantido ou resultados específicos
- Respostas concisas (2–4 parágrafos no máximo, salvo quando pedirem detalhes)

Quando o usuário pedir vagas, oportunidades ou emprego:
- Liste as vagas de "Vagas disponíveis" com cargo, empresa, salário, local e % de compatibilidade
- Indique que pode ver detalhes em /dashboard/vagas
- Se não houver vagas na lista, oriente a acessar /dashboard/vagas
- Entregue a lista primeiro; faça no máximo 1 pergunta complementar

Quando o usuário mencionar valores em reais (ex: "3000", "8 mil", "R$ 12k"):
- Interprete como expectativa salarial mensal em BRL no contexto da conversa
- Compare com as faixas das vagas disponíveis e com a meta salarial do perfil
- Se o valor parecer inconsistente com o seniority (ex: R$ 3.000 para Sênior), confirme educadamente se quis dizer outro valor`;

interface JobSummary {
  title: string;
  company?: string;
  location?: string;
  salary?: string;
  remote?: boolean;
  compatibility?: number;
  href?: string;
}

export interface CareerGoals {
  role?: string;
  location?: string;
  salary?: string;
  availability?: string;
}

export function buildJobeContext(
  profile: ExtractedProfile | null,
  jobs?: JobSummary[],
  goals?: CareerGoals
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

  if (goals && Object.values(goals).some(Boolean)) {
    sections.push(
      [
        "## Metas de carreira",
        goals.role ? `Cargo desejado: ${goals.role}` : "",
        goals.location ? `Localização: ${goals.location}` : "",
        goals.salary ? `Salário alvo: ${goals.salary}` : "",
        goals.availability ? `Disponibilidade: ${goals.availability}` : "",
      ]
        .filter(Boolean)
        .join("\n")
    );
  }

  if (jobs && jobs.length > 0) {
    sections.push(
      [
        "## Vagas disponíveis (dados reais da plataforma)",
        ...jobs.slice(0, 8).map((job) => {
          const parts = [`- ${job.title}`];
          if (job.company) parts.push(`@ ${job.company}`);
          if (job.salary) parts.push(`| ${job.salary}`);
          if (job.location) parts.push(`| ${job.location}`);
          if (job.remote) parts.push("[remoto]");
          if (job.compatibility != null)
            parts.push(`| ${job.compatibility}% compatível`);
          if (job.href) parts.push(`| link: ${job.href}`);
          return parts.join(" ");
        }),
      ].join("\n")
    );
  } else {
    sections.push(
      "## Vagas disponíveis\nNenhuma vaga ranqueada no momento. Oriente o usuário a /dashboard/vagas."
    );
  }

  if (sections.length === 0) {
    return "Nenhum dado de perfil disponível ainda. Responda de forma genérica sobre carreira e vagas.";
  }

  return sections.join("\n\n");
}
