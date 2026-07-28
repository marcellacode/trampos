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
import type { CareerNavBadges } from "@/types/career-context";

/** Navegação principal agrupada pela jornada do candidato */
export const DASHBOARD_NAV_SECTIONS: NavSection[] = [
  {
    id: "journey",
    label: "Minha jornada",
    items: [
      { label: "Início", href: "/dashboard/inicio", icon: LayoutDashboard },
      { label: "Agenda", href: "/dashboard/agenda", icon: Calendar },
    ],
  },
  {
    id: "profile",
    label: "Meu perfil",
    items: [
      { label: "Currículo", href: "/dashboard/curriculo", icon: FileText },
      { label: "Objetivos", href: "/dashboard/objetivos", icon: Crosshair },
      {
        label: "Empregabilidade",
        href: "/dashboard/empregabilidade",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: "opportunities",
    label: "Oportunidades",
    items: [
      { label: "Vagas", href: "/dashboard/vagas", icon: Briefcase },
      { label: "Entrevistas", href: "/dashboard/entrevistas", icon: Mic },
    ],
  },
  {
    id: "community",
    label: "Rede & Comunidade",
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

const BADGE_ROUTES: Record<string, keyof CareerNavBadges> = {
  "/dashboard/vagas": "vagas",
  "/dashboard/agenda": "agenda",
  "/dashboard/mensagens": "mensagens",
  "/dashboard/curriculo": "curriculo",
};

export function applyNavBadges(
  sections: NavSection[],
  badges: CareerNavBadges
): NavSection[] {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => {
      const badgeKey = BADGE_ROUTES[item.href];
      const count = badgeKey ? badges[badgeKey] : 0;
      return count > 0 ? { ...item, badge: count > 99 ? 99 : count } : item;
    }),
  }));
}

export function getDashboardNavSections(
  hasCompanyMembership: boolean,
  badges?: CareerNavBadges
): NavSection[] {
  let sections: NavSection[];

  if (!hasCompanyMembership) {
    sections = DASHBOARD_NAV_SECTIONS;
  } else {
    sections = [
      ...DASHBOARD_NAV_SECTIONS.slice(0, 2),
      COMPANY_NAV_SECTION,
      ...DASHBOARD_NAV_SECTIONS.slice(2),
    ];
  }

  if (badges) {
    sections = applyNavBadges(sections, badges);
  }

  return sections;
}

export const SEARCH_EXAMPLES = [
  "Vagas de React remoto",
  "Como melhorar meu currículo?",
  "Salário médio de Tech Lead",
  "Preparar entrevista técnica",
] as const;
