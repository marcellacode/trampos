import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  FileText,
  Globe2,
  LayoutDashboard,
  Map,
  MessageSquare,
  Mic,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Video,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  briefcase: Briefcase,
  building2: Building2,
  calendar: Calendar,
  checkcircle2: CheckCircle2,
  eye: Eye,
  filetext: FileText,
  globe2: Globe2,
  layoutdashboard: LayoutDashboard,
  map: Map,
  messagesquare: MessageSquare,
  mic: Mic,
  search: Search,
  settings: Settings,
  target: Target,
  trendingup: TrendingUp,
  video: Video,
  bell: Bell,
  barchart3: BarChart3,
};

const COLOR_MAP: Record<string, string> = {
  blue: "#4F7CFF",
  green: "#22C55E",
  purple: "#8B5CF6",
  amber: "#F59E0B",
  pink: "#EC4899",
  nubank: "#820AD1",
};

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name.toLowerCase()] ?? Sparkles;
}

export function resolveColor(token: string, fallback = "#4F7CFF"): string {
  return COLOR_MAP[token.toLowerCase()] ?? fallback;
}

export function resolveGlow(token: string): string {
  const color = resolveColor(token);
  return `${color}59`;
}

export function formatPlan(plan: string): "Free" | "Pro" | "Elite" {
  switch (plan) {
    case "pro":
      return "Pro";
    case "elite":
      return "Elite";
    default:
      return "Free";
  }
}

export function mapCompanyEnvironment(
  value: string | null
): "Startup" | "Scale-up" | "Corporativa" {
  switch (value) {
    case "startup":
      return "Startup";
    case "scale_up":
      return "Scale-up";
    default:
      return "Corporativa";
  }
}

export function mapTechLevel(
  value: string
): "básico" | "intermediário" | "avançado" {
  switch (value) {
    case "basico":
      return "básico";
    case "avancado":
      return "avançado";
    default:
      return "intermediário";
  }
}

export function formatRelativeTime(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${Math.max(minutes, 1)} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function formatChatTimestamp(date: string): string {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function companyInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
