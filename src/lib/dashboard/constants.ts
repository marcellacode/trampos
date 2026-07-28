import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Newspaper,
  Settings,
  Target,
  Users,
} from "lucide-react";
import type { NavItem } from "@/types/dashboard";

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/dashboard/inicio", icon: LayoutDashboard },
  { label: "Feed", href: "/dashboard/feed", icon: Newspaper },
  { label: "Vagas", href: "/dashboard/vagas", icon: Briefcase },
  { label: "Rede", href: "/dashboard/rede", icon: Users },
  { label: "Currículo", href: "/dashboard/curriculo", icon: FileText },
  { label: "Empregabilidade", href: "/dashboard/empregabilidade", icon: Target },
  { label: "Mensagens", href: "/dashboard/mensagens", icon: MessageSquare },
  { label: "Entrevistas", href: "/dashboard/entrevistas", icon: Mic },
  { label: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { label: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
];

export const COMPANY_NAV_ITEM: NavItem = {
  label: "Minha empresa",
  href: "/dashboard/empresa",
  icon: Building2,
};

export const SEARCH_EXAMPLES = [
  "Vagas de React remoto",
  "Como melhorar meu currículo?",
  "Salário médio de Tech Lead",
  "Preparar entrevista técnica",
] as const;
