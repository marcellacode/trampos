import type { JobDetail } from "@/types/jobs";

export const MOCK_JOB_DETAIL: JobDetail = {
  id: "nubank-senior-frontend",
  company: "Nubank",
  role: "Senior Frontend Engineer",
  compatibility: 98,
  approvalProbability: {
    level: "alta",
    stars: 4,
    reasons: [
      "Stack alinhada com seu perfil",
      "Experiência com React acima do requisito",
      "Histórico positivo em processos similares",
    ],
    simulation: {
      stages: [
        { id: "1", label: "Triagem de CV", status: "pass" },
        { id: "2", label: "Entrevista técnica", status: "pass" },
        { id: "3", label: "Entrevista cultural", status: "warning" },
      ],
      suggestion: "Reforce exemplos de liderança técnica informal na entrevista cultural.",
    },
  },
  bestSendTime: {
    dayLabel: "Terça-feira",
    timeRange: "9h – 11h",
    insight: "RH do Nubank responde 2,3× mais rápido nesse horário.",
  },
  salary: "R$ 11k – R$ 14k",
  salaryMin: 11000,
  salaryMax: 14000,
  location: "Remoto · Brasil",
  logo: "Nu",
  color: "#820AD1",
  href: "/dashboard/vagas/nubank-senior-frontend",
  stack: ["React", "TypeScript", "Node.js", "AWS", "Docker"],
  reasons: [
    { id: "1", text: "5+ anos de React no seu currículo", type: "match" },
    { id: "2", text: "Experiência com microfrontends", type: "match" },
    { id: "3", text: "Docker aparece como diferencial", type: "warning" },
  ],
  stats: {
    responseDays: 5,
    processDays: 21,
    steps: 3,
    candidates: 847,
  },
  benefits: [
    "Plano de saúde premium",
    "Stock options",
    "Auxílio home office",
    "Licença parental estendida",
  ],
  remote: true,
  publishedAt: "2026-07-18",
  verified: true,
  whyMatchSummary:
    "Seu perfil combina fortemente com esta vaga: domínio avançado de React, experiência em fintech e histórico de entregas em escala. A principal lacuna é Docker, mas sua curva de aprendizado recente compensa.",
  weightFactors: [
    { label: "Stack técnica", weight: 92 },
    { label: "Experiência", weight: 88 },
    { label: "Cultura", weight: 85 },
    { label: "Salário", weight: 78 },
    { label: "Remoto", weight: 100 },
  ],
  sections: {
    summary: [
      "Time de engenharia responsável por produtos core do app Nubank.",
      "Ambiente de alta autonomia com foco em impacto e qualidade de código.",
    ],
    responsibilities: [
      "Desenvolver features críticas em React com TypeScript",
      "Participar de code reviews e decisões de arquitetura frontend",
      "Colaborar com design e produto em experimentos A/B",
      "Mentorar desenvolvedores de nível pleno e júnior",
    ],
    requirements: [
      "5+ anos de experiência com React",
      "TypeScript avançado",
      "Experiência com testes automatizados",
      "Inglês intermediário",
    ],
    differentials: [
      "Experiência com microfrontends",
      "Conhecimento em AWS",
      "Contribuições open source",
    ],
    benefits: [
      "Plano de saúde premium",
      "Stock options",
      "Auxílio home office R$ 500/mês",
      "Day off no aniversário",
    ],
  },
  techComparison: [
    {
      name: "React",
      requiredLevel: "avançado",
      userLevel: "avançado",
      weight: 30,
    },
    {
      name: "TypeScript",
      requiredLevel: "avançado",
      userLevel: "intermediário",
      weight: 25,
    },
    {
      name: "Docker",
      requiredLevel: "intermediário",
      userLevel: "básico",
      weight: 15,
    },
    {
      name: "AWS",
      requiredLevel: "intermediário",
      userLevel: "intermediário",
      weight: 20,
    },
  ],
  companyProfile: {
    segment: "Fintech · Scale-up",
    employees: "8.000+",
    marketYears: 12,
    rating: 4.7,
    verified: true,
  },
  culture: [
    {
      id: "1",
      label: "Autonomia",
      score: 88,
      description: "Times com alta liberdade de decisão técnica",
    },
    {
      id: "2",
      label: "Inovação",
      score: 92,
      description: "Cultura de experimentação e aprendizado contínuo",
    },
    {
      id: "3",
      label: "Work-life",
      score: 75,
      description: "Flexibilidade remota, ritmo intenso em sprints",
    },
    {
      id: "4",
      label: "Diversidade",
      score: 85,
      description: "Compromisso público com inclusão",
    },
  ],
  salaryComparison: {
    jobMin: 11000,
    jobMax: 14000,
    marketMin: 9000,
    marketMax: 13000,
    userExpectation: 12000,
    insight:
      "A faixa salarial está acima da mediana de mercado para senior frontend em fintech.",
  },
  hiringTimeline: [
    { id: "1", label: "Triagem", avgDays: 3 },
    { id: "2", label: "Técnica", avgDays: 7 },
    { id: "3", label: "Cultural + Oferta", avgDays: 11 },
  ],
  faqs: [
    {
      id: "1",
      question: "O processo é 100% remoto?",
      answer: "Sim, todas as etapas são realizadas online.",
    },
    {
      id: "2",
      question: "Preciso de inglês fluente?",
      answer: "Intermediário é suficiente para o dia a dia.",
    },
  ],
  interviewQuestions: [
    {
      id: "1",
      tech: "React",
      question: "Como você otimizaria re-renders em uma lista com 10k itens?",
    },
    {
      id: "2",
      tech: "TypeScript",
      question: "Explique a diferença entre Pick, Omit e Partial.",
    },
  ],
  githubProjects: [
    {
      id: "1",
      name: "react-virtualized-list",
      description: "Lista virtualizada com React 19",
      relevance: "Demonstra domínio de performance em listas grandes",
    },
  ],
  resumeSuggestions: [
    {
      id: "1",
      text: "Destaque projetos com microfrontends no topo",
      type: "move",
    },
    {
      id: "2",
      text: "Adicione métricas de impacto (ex: +30% conversão)",
      type: "add",
    },
  ],
  portfolioProjects: [
    {
      id: "1",
      name: "Dashboard Fintech",
      description: "Painel analítico com React e Recharts",
      highlight: true,
    },
  ],
  similarCompanies: [
    {
      id: "1",
      name: "PicPay",
      logo: "PP",
      color: "#21C25E",
      compatibility: 94,
      href: "/dashboard/vagas/picpay-frontend",
    },
    {
      id: "2",
      name: "Mercado Livre",
      logo: "ML",
      color: "#FFE600",
      compatibility: 95,
      href: "/dashboard/vagas/ml-frontend",
    },
  ],
  relatedJobs: [
    {
      id: "ml-frontend",
      company: "Mercado Livre",
      role: "Frontend Engineer",
      compatibility: 95,
      salary: "R$ 10k",
      logo: "ML",
      color: "#FFE600",
      href: "/dashboard/vagas/ml-frontend",
    },
    {
      id: "picpay-frontend",
      company: "PicPay",
      role: "Senior Frontend",
      compatibility: 94,
      salary: "R$ 9,5k",
      logo: "PP",
      color: "#21C25E",
      href: "/dashboard/vagas/picpay-frontend",
    },
  ],
  applyChecklist: [
    { id: "1", label: "Currículo atualizado", status: "done" },
    { id: "2", label: "Carta de apresentação", status: "pending" },
    { id: "3", label: "Portfólio linkado", status: "auto" },
  ],
  aiSummary:
    "Vaga altamente compatível com seu perfil técnico e objetivos de carreira.",
  aiSummaryReasons: [
    "Stack principal já dominada",
    "Salário acima da expectativa",
    "Processo enxuto (3 etapas)",
  ],
  studyPlan: {
    topics: [
      { id: "1", title: "React Hooks", priority: 5 },
      { id: "2", title: "Docker", priority: 4 },
      { id: "3", title: "AWS ECS", priority: 3 },
      { id: "4", title: "TypeScript Utility Types", priority: 2 },
    ],
  },
  teamInfo: {
    teamName: "Equipe de Engenharia",
    size: 42,
    stack: ["React", "Node", "Go", "AWS"],
    averageTenureYears: 3.4,
    available: true,
  },
  careerImpact: {
    roles: [
      { id: "1", role: "Tech Lead", upliftPercent: 18 },
      { id: "2", role: "Staff Engineer", upliftPercent: 11 },
      { id: "3", role: "Especialista Front-end", upliftPercent: 23 },
    ],
    explanation:
      "A IA projeta que esta vaga acelera sua trajetória para papéis de liderança técnica e especialização frontend, com o maior ganho em Especialista Front-end (+23%) devido ao domínio de React em escala.",
  },
  comparison: {
    jobs: [
      {
        id: "nubank",
        company: "Nubank",
        logo: "Nu",
        color: "#820AD1",
        salary: "R$11k",
        remote: "Remoto",
        compatibility: 98,
        processSteps: 3,
        benefitsRating: 5,
      },
      {
        id: "ml",
        company: "Mercado Livre",
        logo: "ML",
        color: "#FFE600",
        salary: "R$10k",
        remote: "Híbrido",
        compatibility: 95,
        processSteps: 5,
        benefitsRating: 4,
      },
      {
        id: "picpay",
        company: "PicPay",
        logo: "PP",
        color: "#21C25E",
        salary: "R$9,5k",
        remote: "Remoto",
        compatibility: 94,
        processSteps: 4,
        benefitsRating: 4,
      },
    ],
    recommendedCompanyId: "nubank",
    aiConclusion:
      "Se seu objetivo é crescimento técnico e trabalho remoto, a vaga do Nubank é a melhor opção.",
  },
};
