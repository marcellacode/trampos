import type { ActivityItem, Testimonial } from "@/types/auth";

export const LOGIN_ACTIVITY: ActivityItem[] = [
  { id: "1", label: "Analisando perfil" },
  { id: "2", label: "Encontrando vagas" },
  { id: "3", label: "Compatibilidade", highlight: "97%" },
  { id: "4", label: "Currículo atualizado" },
  { id: "5", label: "Empresa respondeu" },
];

export const LOGIN_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Ana Carolina Silva",
    role: "Desenvolvedora Frontend",
    company: "Nubank",
    avatar: "AC",
    quote:
      "Em 3 semanas a IA conseguiu 4 entrevistas. Eu nem sabia que essas vagas existiam.",
  },
  {
    id: "2",
    name: "Rafael Mendes",
    role: "Product Manager",
    company: "iFood",
    avatar: "RM",
    quote:
      "O currículo adaptado para cada vaga fez toda a diferença. Taxa de retorno de 60%.",
  },
  {
    id: "3",
    name: "Juliana Costa",
    role: "Data Scientist",
    company: "Mercado Livre",
    avatar: "JC",
    quote:
      "A simulação de entrevistas me preparou para perguntas que nunca imaginei.",
  },
  {
    id: "4",
    name: "Pedro Almeida",
    role: "Engenheiro de Software",
    company: "Google",
    avatar: "PA",
    quote:
      "Trabalhava 12h por dia. O TramplyAI fez tudo enquanto eu dormia.",
  },
];

export const AUTH_BRAND = {
  name: "Tramply",
  suffix: "AI",
  fullName: "TramplyAI",
  tagline:
    "Sua carreira agora tem uma Inteligência Artificial trabalhando por você.",
  description:
    "Enquanto você dorme, nossa IA procura vagas, adapta seu currículo e acompanha empresas automaticamente.",
} as const;
