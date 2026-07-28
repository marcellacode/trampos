import type { JobSource } from "@/types/jobs";

export interface ChatJob {
  id: string;
  companyId: string;
  role: string;
  company: string;
  location: string;
  salary: string;
  compatibility: number;
  logo: string;
  color: string;
  href: string;
  remote: boolean;
  aiSummary: string;
  stack: string[];
  source?: JobSource;
  externalUrl?: string;
}

export interface QuickReply {
  id: string;
  label: string;
  emoji?: string;
}

export interface JobeActionButton {
  id: string;
  label: string;
  variant?: "primary" | "secondary" | "danger";
}

export interface JobeConfirmation {
  actionId: string;
  confirmLabel: string;
  cancelLabel: string;
}

export interface JobeMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  jobs?: ChatJob[];
  quickReplies?: QuickReply[];
  actionButtons?: JobeActionButton[];
  confirmation?: JobeConfirmation;
  status?: "loading" | "success" | "error";
}

export interface ApplicationSummary {
  id: string;
  roleTitle: string;
  companyName: string;
  statusLabel: string;
  appliedAt: string | null;
}

export type JobeFlowAction =
  | "welcome"
  | "new-jobs"
  | "update-resume"
  | "track-applications"
  | "search-jobs"
  | "help"
  | "apply-all"
  | "apply-selected"
  | "dismiss-all"
  | "confirm"
  | "cancel";

export const MAIN_MENU_REPLIES: QuickReply[] = [
  { id: "new-jobs", label: "Ver novas vagas" },
  { id: "update-resume", label: "Atualizar currículo" },
  { id: "track-applications", label: "Acompanhar candidaturas" },
  { id: "search-jobs", label: "Procurar vagas" },
  { id: "help", label: "Tirar dúvidas" },
];

export const JOB_LIST_ACTIONS: JobeActionButton[] = [
  { id: "apply-all", label: "Candidatar em todas", variant: "primary" },
  { id: "apply-selected", label: "Candidatar nas selecionadas", variant: "secondary" },
  { id: "dismiss-all", label: "Dispensar todas", variant: "danger" },
];
