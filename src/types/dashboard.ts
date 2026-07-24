import type { LucideIcon } from "lucide-react";

export type DashboardViewState =
  | "default"
  | "loading"
  | "empty-jobs"
  | "empty-interviews"
  | "empty-messages"
  | "new-user";

export interface DashboardUser {
  id: string;
  name: string;
  firstName: string;
  email: string;
  avatar?: string;
  initials: string;
  plan: "Free" | "Pro" | "Elite";
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface TimelineActivity {
  id: string;
  time: string;
  title: string;
  description?: string;
  href: string;
  icon: LucideIcon;
  color: string;
  glow: string;
}

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  delta?: string;
  deltaPositive?: boolean;
  sparkline: number[];
  color: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  duration: string;
  company: string;
  ctaPrimary: string;
  ctaSecondary: string;
  href: string;
}

export interface CareerGoal {
  role: string;
  location: string;
  salary: string;
  availability: string;
}

export interface InterestedCompany {
  id: string;
  name: string;
  role: string;
  status: string;
  timeAgo: string;
  logo: string;
  color: string;
  href: string;
}

export interface JobCard {
  id: string;
  company: string;
  role: string;
  compatibility: number;
  salary: string;
  location: string;
  logo: string;
  color: string;
  href: string;
}

export interface MarketTrend {
  id: string;
  tech: string;
  change: number;
  demand: number;
}

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  impact: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  group: "today" | "yesterday" | "week";
  unread: boolean;
  actionLabel: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export interface DashboardData {
  user: DashboardUser;
  timeline: TimelineActivity[];
  kpis: KpiMetric[];
  recommendation: Recommendation;
  goal: CareerGoal;
  companies: InterestedCompany[];
  jobs: JobCard[];
  market: MarketTrend[];
  suggestions: AISuggestion[];
  chat: ChatMessage[];
  notifications: NotificationItem[];
  unreadNotifications: number;
  unreadMessages: number;
}
