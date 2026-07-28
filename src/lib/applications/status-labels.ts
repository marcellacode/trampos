import type { Database } from "@/lib/supabase/database.types";

export type ApplicationStatus =
  Database["public"]["Enums"]["application_status"];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  interested: "Interessado",
  applied: "Candidatura enviada",
  viewed: "Visualizado",
  interview: "Entrevista",
  rejected: "Rejeitado",
  offer: "Proposta",
};

export const RECRUITER_STATUS_OPTIONS: ApplicationStatus[] = [
  "interested",
  "applied",
  "interview",
  "offer",
  "rejected",
];

export function applicationStatusLabel(status: ApplicationStatus): string {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}
