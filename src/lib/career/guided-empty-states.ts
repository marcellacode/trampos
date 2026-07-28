import type { CareerContext, GuidedEmptyState } from "@/types/career-context";

export function getGuidedEmptyState(context: CareerContext): GuidedEmptyState {
  switch (context.stage) {
    case "onboarding":
      return {
        title: `Seu perfil está ${context.profile.completeness}% completo`,
        description:
          "Complete seu currículo vivo para desbloquear matches personalizados e candidaturas assistidas.",
        steps: [
          {
            label: "Adicionar experiências",
            href: "/dashboard/curriculo",
            done: context.profile.hasExperiences,
          },
          {
            label: "Definir objetivos",
            href: "/dashboard/objetivos",
            done: context.profile.goals.role !== "Não definido",
          },
          {
            label: "Buscar primeiras vagas",
            href: "/dashboard/vagas",
            done: context.matchInsights.topJobs.length > 0,
          },
        ],
        copilotPrompt: "Me ajude a completar meu perfil profissional",
      };

    case "exploring":
      return {
        title: "Encontre vagas compatíveis com seu perfil",
        description:
          "A IA analisou seu currículo e encontrou oportunidades. Comece explorando os melhores matches.",
        steps: [
          {
            label: "Ver top matches",
            href: "/dashboard/vagas",
            done: context.matchInsights.topJobs.length > 0,
          },
          {
            label: "Seguir empresas do seu interesse",
            href: "/dashboard/rede",
            done: context.followedEntities.companyIds.length > 0,
          },
          {
            label: "Salvar vagas favoritas",
            href: "/dashboard/vagas",
            done: false,
          },
        ],
        copilotPrompt: "Quais vagas combinam mais com meu perfil?",
        highlightHref: context.matchInsights.topJobs[0]?.href,
        highlightLabel: context.matchInsights.topJobs[0]
          ? `${context.matchInsights.topJobs[0].role} · ${context.matchInsights.topJobs[0].compatibility}% match`
          : undefined,
      };

    case "applying":
      return {
        title: `${context.activeApplications.length} candidatura${context.activeApplications.length === 1 ? "" : "s"} em andamento`,
        description:
          "Acompanhe seus processos, revise currículos adaptados e prepare-se para entrevistas.",
        steps: [
          {
            label: "Revisar currículos adaptados",
            href: "/dashboard/curriculo",
            done: context.recentActivity.some((a) => a.kind === "resume_tailored"),
          },
          {
            label: "Ver agenda de follow-ups",
            href: "/dashboard/agenda",
            done: context.upcomingEvents.length > 0,
          },
          {
            label: "Preparar entrevista com IA",
            href: "/dashboard/entrevistas",
            done: false,
          },
        ],
        copilotPrompt: "Me ajude a acompanhar minhas candidaturas",
        highlightHref: context.activeApplications[0]?.jobRef
          ? `/dashboard/vagas/${context.activeApplications[0].jobRef}`
          : "/dashboard/agenda",
        highlightLabel: context.activeApplications[0]?.roleTitle,
      };

    case "interviewing":
      return {
        title: "Você está em processo seletivo",
        description:
          "Use o simulador de entrevistas e o copiloto para se preparar com confiança.",
        steps: [
          {
            label: "Simular entrevista técnica",
            href: "/dashboard/entrevistas",
            done: false,
          },
          {
            label: "Revisar currículo adaptado",
            href: "/dashboard/curriculo",
            done: true,
          },
          {
            label: "Ver mensagens de recrutadores",
            href: "/dashboard/mensagens",
            done: context.navBadges.mensagens > 0,
          },
        ],
        copilotPrompt: "Me ajude a preparar para minha entrevista",
      };

    case "networking":
      return {
        title: "Expanda sua rede para encontrar oportunidades",
        description:
          "Seguir empresas e profissionais impacta diretamente suas vagas e seu feed.",
        steps: [
          {
            label: "Seguir empresas do seu objetivo",
            href: "/dashboard/rede",
            done: context.followedEntities.companyIds.length >= 2,
          },
          {
            label: "Ver vagas de empresas seguidas",
            href: "/dashboard/vagas",
            done: false,
          },
          {
            label: "Explorar feed da comunidade",
            href: "/dashboard/feed",
            done: false,
          },
        ],
        copilotPrompt: "Quem devo seguir na minha área?",
      };
  }
}

export function getFeedGuidedEmptyState(context: CareerContext): GuidedEmptyState {
  const base = getGuidedEmptyState(context);

  if (context.followedEntities.companyIds.length === 0) {
    return {
      ...base,
      title: "Seu feed está vazio",
      description:
        "Siga profissionais e empresas para ver atividades, vagas e conteúdo de carreira.",
      steps: [
        { label: "Descobrir profissionais", href: "/dashboard/rede", done: false },
        { label: "Ver vagas recomendadas", href: "/dashboard/vagas", done: context.matchInsights.topJobs.length > 0 },
        { label: "Explorar conteúdo público", href: "/dashboard/feed", done: false },
      ],
    };
  }

  return base;
}

export function getAgendaGuidedEmptyState(context: CareerContext): GuidedEmptyState {
  return {
    title: "Sua agenda de carreira",
    description:
      "Candidaturas, follow-ups e entrevistas aparecerão aqui automaticamente.",
    steps: [
      {
        label: "Buscar vagas compatíveis",
        href: "/dashboard/vagas",
        done: context.matchInsights.topJobs.length > 0,
      },
      {
        label: "Candidatar-se com IA",
        href: context.matchInsights.topJobs[0]?.href ?? "/dashboard/vagas",
        done: context.activeApplications.length > 0,
      },
      {
        label: "Agendar simulação de entrevista",
        href: "/dashboard/entrevistas",
        done: false,
      },
    ],
    copilotPrompt: "O que devo fazer agora na minha jornada?",
  };
}

export function getRedeGuidedEmptyState(context: CareerContext): GuidedEmptyState {
  const goalRole =
    context.profile.goals.role !== "Não definido"
      ? context.profile.goals.role
      : "sua área";

  return {
    title: "Construa sua rede profissional",
    description: `Seguir empresas e profissionais de ${goalRole} impacta vagas e feed.`,
    steps: [
      { label: "Ver sugestões personalizadas", href: "/dashboard/rede", done: false },
      {
        label: "Seguir empresas do seu objetivo",
        href: "/dashboard/rede",
        done: context.followedEntities.companyIds.length > 0,
      },
      {
        label: "Ver vagas prioritárias",
        href: "/dashboard/vagas",
        done: context.matchInsights.topJobs.length > 0,
      },
    ],
    copilotPrompt: `Quem devo seguir em ${goalRole}?`,
  };
}
