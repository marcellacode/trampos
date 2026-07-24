import {
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Globe2,
  LayoutDashboard,
  Map,
  MessageSquare,
  Mic,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import type { NavItem } from "@/types/dashboard";
import { AUTH_BRAND } from "@/lib/auth/constants";

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { label: "Copiloto", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vagas", href: "/dashboard/vagas", icon: Briefcase },
  { label: AUTH_BRAND.assistantName, href: "/dashboard/assistente", icon: Sparkles },
  { label: "Currículo", href: "/dashboard/curriculo", icon: FileText },
  { label: "Portfólio", href: "/dashboard/portfolio", icon: Globe2 },
  { label: "Objetivos", href: "/dashboard/objetivos", icon: Target },
  {
    label: "Empregabilidade",
    href: "/dashboard/empregabilidade",
    icon: Map,
  },
  { label: "Mercado", href: "/dashboard/mercado", icon: BarChart3 },
  { label: "Entrevistas", href: "/dashboard/entrevistas", icon: Mic },
  { label: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { label: "Mensagens", href: "/dashboard/mensagens", icon: MessageSquare },
  { label: "Empresas Favoritas", href: "/dashboard/empresas", icon: Building2 },
  { label: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
];

export const SEARCH_EXAMPLES = [
  "Encontre vagas React.",
  "Como melhorar meu currículo?",
  "Quanto ganha um Tech Lead?",
  "Prepare-me para entrevista.",
] as const;
