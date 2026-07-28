import type { CareerContext } from "@/types/career-context";
import type { DashboardData } from "@/types/dashboard";

export function buildCopilotContext(context: CareerContext): string {
  const sections: string[] = [
    "## Contexto da jornada",
    `Estágio: ${stageLabel(context.stage)}`,
    `Perfil: ${context.profile.completeness}% completo`,
    `Objetivo: ${context.profile.goals.role} em ${context.profile.goals.location}`,
    `Candidaturas ativas: ${context.activeApplications.length}`,
    `Empresas seguidas: ${context.followedEntities.companyNames.length}`,
  ];

  if (context.activeApplications[0]) {
    const app = context.activeApplications[0];
    sections.push(`Candidatura mais recente: ${app.roleTitle} (${app.statusLabel})`);
  }

  if (context.upcomingEvents[0]) {
    sections.push(`Próximo evento: ${context.upcomingEvents[0].title}`);
  }

  if (context.matchInsights.topJobs[0]) {
    const top = context.matchInsights.topJobs[0];
    sections.push(
      `Top match: ${top.role} @ ${top.company} (${top.compatibility}%)`
    );
  }

  if (context.profile.missingFields.length > 0) {
    sections.push(
      `Campos pendentes: ${context.profile.missingFields.slice(0, 4).join(", ")}`
    );
  }

  return sections.join("\n");
}

export function buildCopilotContextFromDashboard(data: DashboardData): string {
  const matched = data.jobs.filter((j) => j.hasMatch);
  const sections: string[] = [
    "## Contexto da jornada",
    `Usuário: ${data.user.firstName}`,
    `Objetivo: ${data.goal.role} · ${data.goal.location}`,
    `Timeline: ${data.timeline.length} eventos`,
    `Candidaturas em empresas: ${data.companies.length}`,
    `Matches: ${matched.length} vagas`,
  ];

  if (matched[0]) {
    sections.push(
      `Melhor match: ${matched[0].role} @ ${matched[0].company} (${matched[0].compatibility}%)`
    );
  }

  if (data.suggestions[0]) {
    sections.push(`Sugestão IA: ${data.suggestions[0].title}`);
  }

  return sections.join("\n");
}

export function appendCareerContextToPrompt(
  basePrompt: string,
  context: CareerContext | null
): string {
  if (!context) return basePrompt;
  return `${basePrompt}\n\n${buildCopilotContext(context)}`;
}

function stageLabel(stage: CareerContext["stage"]): string {
  const labels: Record<CareerContext["stage"], string> = {
    onboarding: "Completando perfil",
    exploring: "Explorando oportunidades",
    applying: "Candidaturas ativas",
    interviewing: "Em processo seletivo",
    networking: "Expandindo rede",
  };
  return labels[stage];
}

export const COPILOT_QUICK_ACTIONS: Record<
  string,
  { label: string; prompt: string }[]
> = {
  "/dashboard/vagas": [
    { label: "Quais vagas combinam comigo?", prompt: "Quais vagas combinam mais com meu perfil?" },
    { label: "Adaptar currículo", prompt: "Como adaptar meu currículo para a vaga selecionada?" },
  ],
  "/dashboard/curriculo": [
    { label: "O que falta no perfil?", prompt: "O que falta no meu perfil para aumentar compatibilidade?" },
    { label: "Gerar resumo", prompt: "Gere um resumo profissional com base no meu perfil." },
  ],
  "/dashboard/feed": [
    { label: "Compartilhar conquista", prompt: "Sugira um post sobre minha evolução de carreira." },
  ],
  "/dashboard/agenda": [
    { label: "Preparar entrevista", prompt: "Me ajude a preparar para minha próxima entrevista." },
    { label: "Escrever follow-up", prompt: "Escreva um follow-up para minha candidatura mais recente." },
  ],
  "/dashboard/rede": [
    { label: "Quem seguir?", prompt: "Quem devo seguir na minha área para encontrar oportunidades?" },
  ],
  "/dashboard/inicio": [
    { label: "Próximo passo", prompt: "Qual o próximo passo ideal na minha jornada de carreira?" },
  ],
};

export function getCopilotQuickActions(pathname: string) {
  if (COPILOT_QUICK_ACTIONS[pathname]) {
    return COPILOT_QUICK_ACTIONS[pathname];
  }

  for (const [prefix, actions] of Object.entries(COPILOT_QUICK_ACTIONS)) {
    if (prefix !== "/dashboard/inicio" && pathname.startsWith(prefix)) {
      return actions;
    }
  }

  return COPILOT_QUICK_ACTIONS["/dashboard/inicio"];
}
