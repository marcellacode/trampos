import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreatePostInput,
  FeedCursor,
  FeedMode,
  FeedPage,
  FeedPost,
} from "@/types/feed";
import { formatRelativeTime } from "@/lib/supabase/utils";
import { fetchFollowedAuthorIds } from "@/lib/supabase/queries/follows";
import { fetchBlockedUserIds } from "@/lib/supabase/queries/moderation";
import { fetchPostEngagementBatch } from "@/lib/supabase/queries/post-engagement";
import {
  applyEngagementToPost,
  collectEngagementPostIds,
  mapFeedPostRow,
  POST_SELECT,
  type DbFeedPostRow,
} from "@/lib/supabase/queries/feed-mapper";

const FEED_PAGE_SIZE = 20;

export function encodeFeedCursor(cursor: FeedCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeFeedCursor(value: string | null | undefined): FeedCursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as FeedCursor;
    if (parsed?.createdAt && parsed?.id) return parsed;
    return null;
  } catch {
    return null;
  }
}

export async function fetchFeedPosts(
  supabase: SupabaseClient,
  options: {
    cursor?: FeedCursor | null;
    limit?: number;
    viewerUserId?: string;
    mode?: FeedMode;
  } = {}
): Promise<FeedPage> {
  const limit = options.limit ?? FEED_PAGE_SIZE;
  const mode = options.mode ?? "for_you";

  let authorUserIds: string[] = [];
  let authorCompanyIds: string[] = [];
  let blockedUserIds: string[] = [];

  if (options.viewerUserId) {
    const [followed, blocked] = await Promise.all([
      fetchFollowedAuthorIds(supabase, options.viewerUserId),
      fetchBlockedUserIds(supabase, options.viewerUserId),
    ]);
    authorUserIds = [...new Set([options.viewerUserId, ...followed.userIds])];
    authorCompanyIds = followed.companyIds;
    blockedUserIds = blocked;
  }

  let query = supabase.from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (mode === "explore") {
    query = query.eq("visibility", "public");
  } else if (options.viewerUserId) {
    const orFilters: string[] = ["visibility.eq.public"];
    if (authorUserIds.length > 0) {
      orFilters.push(`author_user_id.in.(${authorUserIds.join(",")})`);
    }
    if (authorCompanyIds.length > 0) {
      orFilters.push(`author_company_id.in.(${authorCompanyIds.join(",")})`);
    }
    query = query.or(orFilters.join(","));
  }

  if (options.cursor) {
    const { createdAt, id } = options.cursor;
    query = query.or(
      `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  let rows = (data ?? []) as DbFeedPostRow[];

  if (blockedUserIds.length > 0) {
    const blockedSet = new Set(blockedUserIds);
    rows = rows.filter(
      (row) => !row.author_user_id || !blockedSet.has(row.author_user_id)
    );
  }

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  let posts = pageRows.map((row) => mapFeedPostRow(row));

  if (options.viewerUserId && posts.length > 0) {
    const engagementIds = collectEngagementPostIds(posts);
    const engagementByPostId = await fetchPostEngagementBatch(
      supabase,
      engagementIds,
      options.viewerUserId
    );
    posts = posts.map((post) => applyEngagementToPost(post, engagementByPostId));
  }

  const last = pageRows.at(-1);
  const nextCursor =
    hasMore && last ? { createdAt: last.created_at, id: last.id } : null;

  return { posts, nextCursor };
}

export async function createFeedPost(
  supabase: SupabaseClient,
  userId: string,
  input: CreatePostInput
): Promise<FeedPost> {
  const content = input.content.trim();
  const jobId = input.jobId ?? null;

  if (!content && !jobId) {
    throw new Error("Escreva algo ou compartilhe uma vaga.");
  }

  if (input.authorCompanyId) {
    const { data, error } = await supabase.from("posts")
      .insert({
        author_company_id: input.authorCompanyId,
        content,
        job_id: jobId,
        visibility: input.visibility ?? "public",
        media_urls: input.mediaUrls ?? [],
      })
      .select(POST_SELECT)
      .single();

    if (error) throw error;
    return mapFeedPostRow(data as DbFeedPostRow);
  }

  const { data, error } = await supabase.from("posts")
    .insert({
      author_user_id: userId,
      content,
      job_id: jobId,
      visibility: input.visibility ?? "public",
      media_urls: input.mediaUrls ?? [],
    })
    .select(POST_SELECT)
    .single();

  if (error) throw error;
  return mapFeedPostRow(data as DbFeedPostRow);
}

export async function deleteFeedPost(
  supabase: SupabaseClient,
  postId: string
): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}

export function formatPostTimestamp(iso: string): string {
  return formatRelativeTime(iso);
}

export { FEED_PAGE_SIZE };
