export type FollowTargetType = "user" | "company";

export interface FollowStatus {
  isFollowing: boolean;
  followerCount: number;
  followingCount?: number;
}

export interface FollowUserSummary {
  id: string;
  slug: string | null;
  fullName: string;
  headline: string;
  avatarUrl: string | null;
  avatarInitials: string;
  location: string;
  isFollowing: boolean;
}

export interface FollowCompanySummary {
  id: string;
  slug: string;
  name: string;
  logo: string;
  brandColor: string;
  segment: string;
  isFollowing: boolean;
  followerCount: number;
}

export interface FollowingList {
  users: FollowUserSummary[];
  companies: FollowCompanySummary[];
}

export interface FollowersList {
  users: FollowUserSummary[];
}

export interface FollowSuggestions {
  users: FollowUserSummary[];
  companies: FollowCompanySummary[];
}

export interface ToggleFollowResult {
  isFollowing: boolean;
  followerCount: number;
}
