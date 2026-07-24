export type ImportMethod = "linkedin" | "github" | "resume" | "scratch";

export type AvailabilityOption =
  | "immediate"
  | "15days"
  | "30days"
  | "45days"
  | "other";

export type WorkModel = "onsite" | "hybrid" | "remote" | "any";

export type ContractType = "clt" | "pj" | "freelancer" | "international";

export type OnboardingStep =
  | "import"
  | "processing"
  | "summary"
  | "goals"
  | "availability"
  | "profile"
  | "success";

export interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tech: string[];
  stars?: number;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface ExtractedProfile {
  name: string;
  currentRole: string;
  summary: string;
  avatarInitials: string;
  experiences: Experience[];
  skills: string[];
  languages: Language[];
  projects: Project[];
  certificates: Certificate[];
  seniority: string;
}

export interface GoalChip {
  id: string;
  label: string;
  category: "skill" | "role" | "location" | "salary" | "contract" | "model";
}

export interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  type: "github" | "linkedin" | "skill" | "project" | "experience";
}

export interface OnboardingData {
  importMethod: ImportMethod | null;
  profile: ExtractedProfile;
  goalText: string;
  goalChips: GoalChip[];
  availability: AvailabilityOption | null;
  workModels: WorkModel[];
  contractTypes: ContractType[];
  appliedSuggestions: string[];
  uploadedFileName: string | null;
}

export type OnboardingErrorCode =
  | "invalid_file"
  | "upload_failed"
  | "linkedin_failed"
  | "github_failed"
  | "offline"
  | "unknown";

export interface OnboardingError {
  code: OnboardingErrorCode;
  message: string;
}
