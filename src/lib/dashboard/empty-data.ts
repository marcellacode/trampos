import type { DashboardData, DashboardUser } from "@/types/dashboard";

export const DEFAULT_USER: DashboardUser = {
  id: "",
  name: "Usuário",
  firstName: "Usuário",
  email: "",
  initials: "U",
  plan: "Free",
};

export const EMPTY_DASHBOARD: DashboardData = {
  user: DEFAULT_USER,
  unreadNotifications: 0,
  unreadMessages: 0,
  timeline: [],
  kpis: [],
  recommendation: {
    id: "",
    title: "",
    description: "",
    duration: "",
    company: "",
    ctaPrimary: "",
    ctaSecondary: "",
    href: "/dashboard/vagas",
  },
  goal: {
    role: "Não definido",
    location: "Não definido",
    salary: "Não definido",
    availability: "Não definido",
  },
  companies: [],
  jobs: [],
  market: [],
  employability: [],
  employabilityOverview: {
    score: 0,
    goal: 100,
    missions: [],
  },
  suggestions: [],
  chat: [],
  notifications: [],
};

export function isDashboardEmpty(data: DashboardData): boolean {
  return (
    data.jobs.length === 0 &&
    data.timeline.length === 0 &&
    data.kpis.length === 0 &&
    data.notifications.length === 0
  );
}
