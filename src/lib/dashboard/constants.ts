import {
  Briefcase,
  Building2,
  Calendar,
  Crosshair,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Newspaper,
  TrendingUp,
  UserCheck,
  Users,
  ClipboardList,
} from "lucide-react";
import type { NavItem, NavSection } from "@/types/dashboard";

/** Navegação principal agrupada por jornada do candidato */
export const DASHBOARD_NAV_SECTIONS: NavSection[] = [
  {
    id: "overview",
    label: "Visão geral",
    items: [
      { label: "Início", href: "/dashboard/inicio", icon: LayoutDashboard },
    ],
  },
  {
    id: "opportunities",
    label: "Oportunidades",
    items: [
      { label: "Vagas", href: "/dashboard/vagas", icon: Briefcase },
      { label: "Objetivos", href: "/dashboard/objetivos", icon: Crosshair },
      { label: "Agenda", href: "/dashboard/agenda", icon: Calendar },
    ],
  },
  {
    id: "career",
    label: "Carreira",
    items: [
      { label: "Currículo", href: "/dashboard/curriculo", icon: FileText },
      {
        label: "Empregabilidade",
        href: "/dashboard/empregabilidade",
        icon: TrendingUp,
      },
      { label: "Entrevistas", href: "/dashboard/entrevistas", icon: Mic },
    ],
  },
  {
    id: "community",
    label: "Comunidade",
    items: [
      { label: "Feed", href: "/dashboard/feed", icon: Newspaper },
      { label: "Rede", href: "/dashboard/rede", icon: Users },
      { label: "Mensagens", href: "/dashboard/mensagens", icon: MessageSquare },
    ],
  },
];

/** Navegação do recrutador — visível apenas para membros de empresa */
export const COMPANY_NAV_SECTION: NavSection = {
  id: "company",
  label: "Recrutamento",
  items: [
    { label: "Perfil da empresa", href: "/dashboard/empresa", icon: Building2 },
    {
      label: "Vagas publicadas",
      href: "/dashboard/empresa/vagas",
      icon: ClipboardList,
    },
    {
      label: "Candidatos",
      href: "/dashboard/empresa/candidatos",
      icon: UserCheck,
    },
  ],
};

/** Lista plana para compatibilidade (ex.: testes, buscas) */
export const DASHBOARD_NAV_ITEMS: NavItem[] = DASHBOARD_NAV_SECTIONS.flatMap(
  (section) => section.items
);

export const COMPANY_NAV_ITEM: NavItem = COMPANY_NAV_SECTION.items[0];

export function getDashboardNavSections(
  hasCompanyMembership: boolean
): NavSection[] {
  if (!hasCompanyMembership) {
    return DASHBOARD_NAV_SECTIONS;
  }

  return [
    ...DASHBOARD_NAV_SECTIONS.slice(0, 2),
    COMPANY_NAV_SECTION,
    ...DASHBOARD_NAV_SECTIONS.slice(2),
  ];
}

export const SEARCH_EXAMPLES = [
  "Vagas de React remoto",
  "Como melhorar meu currículo?",
  "Salário médio de Tech Lead",
  "Preparar entrevista técnica",
] as const;
