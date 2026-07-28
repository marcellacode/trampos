export type PostVisibility = "public" | "followers";

export interface FeedAuthorUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  avatarInitials: string;
  slug: string | null;
  headline: string;
}

export interface FeedAuthorCompany {
  id: string;
  name: string;
  logo: string | null;
  brandColor: string;
  slug: string;
}

export interface FeedJobPreview {
  id: string;
  slug: string;
  title: string;
  location: string;
  salaryDisplay: string;
  remote: boolean;
  companyName: string;
  companyLogo: string | null;
  companyColor: string;
}

export interface FeedPost {
  id: string;
  content: string;
  mediaUrls: string[];
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
  authorUser: FeedAuthorUser | null;
  authorCompany: FeedAuthorCompany | null;
  job: FeedJobPreview | null;
  likeCount: number;
  commentCount: number;
}

export interface FeedCursor {
  createdAt: string;
  id: string;
}

export interface FeedPage {
  posts: FeedPost[];
  nextCursor: FeedCursor | null;
}

export interface CreatePostInput {
  content: string;
  visibility?: PostVisibility;
  jobId?: string | null;
  authorCompanyId?: string | null;
  mediaUrls?: string[];
}
