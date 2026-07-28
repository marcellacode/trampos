import type { AISuggestion } from "@/types/dashboard";
import type { CareerActivity } from "@/types/career-context";
import type { JobCard } from "@/types/dashboard";
import type { FeedPost } from "@/types/feed";

export type FeedItemType =
  | "post"
  | "activity"
  | "job_recommendation"
  | "ai_tip";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  createdAt: string;
  data: FeedPost | CareerActivity | JobCard | AISuggestion;
}

function toTimestamp(value: string): number {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function mergeUnifiedFeed(input: {
  posts: FeedPost[];
  activities: CareerActivity[];
  topJobs: JobCard[];
  aiTips: AISuggestion[];
  maxItems?: number;
}): FeedItem[] {
  const items: FeedItem[] = [
    ...input.posts.map(
      (post): FeedItem => ({
        id: `post-${post.id}`,
        type: "post",
        createdAt: post.createdAt,
        data: post,
      })
    ),
    ...input.activities.map(
      (activity): FeedItem => ({
        id: `activity-${activity.id}`,
        type: "activity",
        createdAt: activity.createdAt,
        data: activity,
      })
    ),
    ...input.topJobs.slice(0, 3).map(
      (job): FeedItem => ({
        id: `job-${job.id}`,
        type: "job_recommendation",
        createdAt: new Date().toISOString(),
        data: job,
      })
    ),
    ...input.aiTips.slice(0, 2).map(
      (tip): FeedItem => ({
        id: `tip-${tip.id}`,
        type: "ai_tip",
        createdAt: new Date().toISOString(),
        data: tip,
      })
    ),
  ];

  return items
    .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
    .slice(0, input.maxItems ?? 50);
}

export function interleaveCareerItems(
  posts: FeedPost[],
  careerItems: FeedItem[]
): FeedItem[] {
  const postItems: FeedItem[] = posts.map((post) => ({
    id: `post-${post.id}`,
    type: "post",
    createdAt: post.createdAt,
    data: post,
  }));

  const merged = [...postItems, ...careerItems];
  return merged.sort(
    (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
  );
}
