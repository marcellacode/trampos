import type { CompanyProfile, JobStats } from "@/types/jobs";

export type CompanyMemberRole = "admin" | "recruiter" | "viewer";

export interface PublicCompanyJob {
  id: string;
  slug: string;
  title: string;
  location: string;
  salary: string;
  remote: boolean;
  href: string;
}

export interface PublicCompany {
  id: string;
  slug: string;
  name: string;
  logo: string;
  brandColor: string;
  segment: string;
  bio: string;
  coverUrl: string | null;
  isClaimed: boolean;
  claimedAt: string | null;
  verified: boolean;
  remoteFriendly: boolean;
  benefits: string[];
  profile: CompanyProfile;
  stats: JobStats;
  jobs: PublicCompanyJob[];
}

export interface CompanyMembership {
  id: string;
  companyId: string;
  role: CompanyMemberRole;
  createdAt: string;
  company: {
    id: string;
    slug: string;
    name: string;
    logo: string;
    brandColor: string;
    isClaimed: boolean;
  };
}

export interface EditableCompany {
  id: string;
  slug: string;
  name: string;
  logo: string;
  brandColor: string;
  segment: string;
  bio: string;
  coverUrl: string | null;
  benefits: string[];
  role: CompanyMemberRole;
}
