import type {
  AiSuggestion,
  AvailabilityOption,
  ContractType,
  ExtractedProfile,
  OnboardingStep,
  ProfessionalDna,
  WorkModel,
} from "@/types/onboarding";

export const ONBOARDING_TOTAL_STEPS = 7;

export const STEP_META: Record<
  OnboardingStep,
  { number: number; label: string }
> = {
  import: { number: 1, label: "Começar" },
  processing: { number: 2, label: "Análise" },
  summary: { number: 2, label: "Resumo" },
  goals: { number: 3, label: "Objetivos" },
  availability: { number: 4, label: "Disponibilidade" },
  profile: { number: 5, label: "Perfil" },
  dna: { number: 6, label: "DNA" },
  success: { number: 7, label: "Pronto" },
};

export const PROCESSING_MESSAGES = [
  "Extraindo informações...",
  "Detectando experiências...",
  "Identificando competências...",
  "Encontrando certificados...",
  "Reconhecendo idiomas...",
  "Calculando senioridade...",
] as const;

export const PROCESSING_DURATION_MS = 15_000;

export const AVAILABILITY_OPTIONS: {
  value: AvailabilityOption;
  label: string;
  description: string;
}[] = [
  {
    value: "immediate",
    label: "Posso começar imediatamente",
    description: "Disponível agora para entrevistas e propostas.",
  },
  {
    value: "15days",
    label: "15 dias",
    description: "Preciso de um aviso curto para transição.",
  },
  {
    value: "30days",
    label: "30 dias",
    description: "Janela padrão de aviso prévio.",
  },
  {
    value: "45days",
    label: "45 dias",
    description: "Preciso de mais tempo para finalizar projetos.",
  },
  {
    value: "other",
    label: "Outro",
    description: "Combinamos a data depois.",
  },
];

export const WORK_MODEL_OPTIONS: {
  value: WorkModel;
  label: string;
  description: string;
}[] = [
  {
    value: "onsite",
    label: "Presencial",
    description: "Escritório no dia a dia.",
  },
  {
    value: "hybrid",
    label: "Híbrido",
    description: "Mistura de home office e escritório.",
  },
  {
    value: "remote",
    label: "Remoto",
    description: "100% home office.",
  },
  {
    value: "any",
    label: "Aceito qualquer um",
    description: "Flexível conforme a oportunidade.",
  },
];

export const CONTRACT_OPTIONS: {
  value: ContractType;
  label: string;
  description: string;
}[] = [
  {
    value: "clt",
    label: "CLT",
    description: "Carteira assinada com benefícios.",
  },
  {
    value: "pj",
    label: "PJ",
    description: "Contrato como pessoa jurídica.",
  },
  {
    value: "freelancer",
    label: "Freelancer",
    description: "Projetos pontuais ou por demanda.",
  },
  {
    value: "international",
    label: "Internacional",
    description: "Contratos com empresas no exterior.",
  },
];

export const EMPTY_PROFILE: ExtractedProfile = {
  name: "",
  currentRole: "",
  summary: "",
  avatarInitials: "?",
  experiences: [],
  skills: [],
  languages: [],
  projects: [],
  certificates: [],
  seniority: "",
};

export const MOCK_EXTRACTED_PROFILE: ExtractedProfile = {
  name: "Ana Carolina Silva",
  currentRole: "Desenvolvedora Front-end React",
  summary:
    "Front-end com 5 anos de experiência construindo produtos digitais de alta performance. Especialista em React, TypeScript e design systems.",
  avatarInitials: "AC",
  seniority: "Pleno / Sênior",
  experiences: [
    {
      id: "exp-1",
      company: "Nubank",
      role: "Desenvolvedora Front-end",
      period: "2022 — Atual",
      description:
        "Liderou a evolução do design system e entregou features críticas de onboarding com impacto em milhões de usuários.",
    },
    {
      id: "exp-2",
      company: "iFood",
      role: "Front-end Engineer",
      period: "2020 — 2022",
      description:
        "Construí dashboards de alta performance e componentes reutilizáveis em React + TypeScript.",
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "Next.js",
    "TailwindCSS",
    "Framer Motion",
    "Design Systems",
    "GraphQL",
    "Jest",
  ],
  languages: [
    { id: "lang-1", name: "Português", level: "Nativo" },
    { id: "lang-2", name: "Inglês", level: "Avançado (C1)" },
    { id: "lang-3", name: "Espanhol", level: "Intermediário" },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Design System Atlas",
      description: "Biblioteca de componentes usada por 8 squads.",
      tech: ["React", "Storybook", "TypeScript"],
      stars: 128,
    },
    {
      id: "proj-2",
      name: "Job Match Engine UI",
      description: "Interface de matching com score de compatibilidade em tempo real.",
      tech: ["Next.js", "Framer Motion", "Tailwind"],
      stars: 64,
    },
  ],
  certificates: [
    {
      id: "cert-1",
      name: "Advanced React",
      issuer: "Frontend Masters",
      year: "2024",
    },
    {
      id: "cert-2",
      name: "TypeScript Professional",
      issuer: "Microsoft",
      year: "2023",
    },
  ],
};

export const MOCK_AI_SUGGESTIONS: AiSuggestion[] = [
  {
    id: "sug-1",
    title: "Importar projetos do GitHub",
    description:
      "Seu GitHub possui 14 projetos públicos. Deseja importar os mais relevantes automaticamente?",
    actionLabel: "Importar automaticamente",
    type: "github",
  },
  {
    id: "sug-2",
    title: "Adicionar o projeto Atlas",
    description:
      "Sugiro destacar o Design System Atlas — ele demonstra liderança técnica e impacto em escala.",
    actionLabel: "Adicionar ao perfil",
    type: "project",
  },
  {
    id: "sug-3",
    title: "Refinar competências",
    description:
      "Detectei menções a Accessibility e Performance. Quer incluí-las nas skills principais?",
    actionLabel: "Adicionar skills",
    type: "skill",
  },
];

export const MOCK_PROFESSIONAL_DNA: ProfessionalDna = {
  predominantProfile: "Construtora de Produtos",
  strengths: [
    "Forte em Front-end",
    "Boa comunicação",
    "Perfil analítico",
    "Facilidade para aprender tecnologias",
    "Boa aderência a startups",
  ],
  compatibility: [
    { label: "Startups", score: 96 },
    { label: "Scale-ups", score: 91 },
    { label: "Grandes empresas", score: 84 },
    { label: "Consultorias", score: 76 },
  ],
  salary: {
    current: {
      brazil: {
        currency: "BRL",
        min: 7500,
        max: 9000,
        label: "Brasil",
      },
      international: {
        currency: "USD",
        min: 3000,
        max: 4200,
        label: "Internacional",
      },
    },
    withSkills: {
      skillsLabel: "Docker + AWS",
      brazil: {
        currency: "BRL",
        min: 9000,
        max: 11000,
        label: "Brasil",
      },
      international: {
        currency: "USD",
        min: 4500,
        max: null,
        label: "Internacional",
      },
    },
  },
};

export const SUCCESS_STATS = {
  jobsAnalyzed: 2438,
  matches: 23,
  verifiedCompanies: 8,
} as const;

export const ACCEPTED_RESUME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
] as const;

export const ERROR_MESSAGES = {
  invalid_file: "Arquivo inválido. Envie um PDF ou DOCX de até 10MB.",
  upload_failed: "Falha ao enviar o currículo. Tente novamente.",
  linkedin_failed: "Não foi possível importar o LinkedIn. Tente outra forma.",
  github_failed: "Falha ao analisar o GitHub. Verifique a conexão e tente de novo.",
  offline: "Sem conexão. Verifique sua internet e tente novamente.",
  unknown: "Algo deu errado. Tente novamente em instantes.",
} as const;
