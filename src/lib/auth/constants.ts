import type { ActivityItem, Testimonial } from "@/types/auth";

export const LOGIN_ACTIVITY: ActivityItem[] = [
  { id: "1", label: "Analisando perfil" },
  { id: "2", label: "Encontrando vagas" },
  { id: "3", label: "Calculando compatibilidade" },
  { id: "4", label: "Personalizando currículo" },
  { id: "5", label: "Preparando candidatura" },
];

export const LOGIN_TESTIMONIALS: Testimonial[] = [];

export const AUTH_BRAND = {
  name: "Tramply",
  suffix: "AI",
  fullName: "TramplyAI",
  tagline:
    "Sua carreira agora tem uma Inteligência Artificial trabalhando por você.",
  description:
    "Enquanto você dorme, nossa IA procura vagas, adapta seu currículo e acompanha empresas automaticamente.",
} as const;
