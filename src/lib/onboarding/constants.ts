import type {
  AvailabilityOption,
  ContractType,
  ExtractedProfile,
  OnboardingStep,
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
