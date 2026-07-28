import {
  Briefcase,
  Calendar,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Settings,
} from "lucide-react";
import type { NavItem } from "@/types/dashboard";

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vagas", href: "/dashboard/vagas", icon: Briefcase },
  { label: "Currículo", href: "/dashboard/curriculo", icon: FileText },
  { label: "Entrevistas", href: "/dashboard/entrevistas", icon: Mic },
  { label: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { label: "Mensagens", href: "/dashboard/mensagens", icon: MessageSquare },
  { label: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
];

export const SEARCH_EXAMPLES = [
  "Vagas de React remoto",
  "Como melhorar meu currículo?",
  "Salário médio de Tech Lead",
  "Preparar entrevista técnica",
] as const;
