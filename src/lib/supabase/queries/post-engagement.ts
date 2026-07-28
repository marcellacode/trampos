import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedComment, FeedPost } from "@/types/feed";
import { fromExtendedTable } from "@/lib/supabase/extended-client";
import { notifyPostAuthor } from "@/lib/feed/post-notifications";
import {
  mapFeedPostRow,
  POST_SELECT,
  type DbFeedPostRow,
} from "@/lib/supabase/queries/feed-mapper";

const COMMENT_SELECT = `
  id,
  post_id,
  user_id,
  parent_comment_id,
  content,
  created_at,
  updated_at,
  author:profiles!post_comments_user_id_fkey (
    id,
    full_name,
    avatar_url,
    avatar_initials,
    slug,
    headline
  )
`;

interface DbCommentAuthor {
  id: string;
  full_name: string;
  avatar_url: string | null;
  avatar_initials: string;
  slug: string | null;
  headline: string;
}

interface DbCommentRow {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  author: DbCommentAuthor | DbCommentAuthor[] | null;
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapComment(row: DbCommentRow): FeedComment {
  const author = unwrapOne(row.author);

  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    parentCommentId: row.parent_comment_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    author: author
      ? {
          id: author.id,
          fullName: author.full_name,
          avatarUrl: author.avatar_url,
          avatarInitials: author.avatar_initials,
          slug: author.slug,
          headline: author.headline,
        }
      : {
          id: row.user_id,
          fullName: "Usuário",
          avatarUrl: null,
          avatarInitials: "U",
          slug: null,
          headline: "",
        },
  };
}

export interface PostEngagementCounts {
  likeCount: number;
  commentCount: number;
  shareCount: number;
  likedByMe: boolean;
}

export async function fetchPostEngagementBatch(
  supabase: SupabaseClient,
  postIds: string[],
  viewerUserId: string
): Promise<Map<string, PostEngagementCounts>> {
  const result = new Map<string, PostEngagementCounts>();
  if (postIds.length === 0) return result;

  const defaultCounts = (): PostEngagementCounts => ({
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    likedByMe: false,
  });

  for (const id of postIds) {
    result.set(id, defaultCounts());
  }

  const { data: counts, error: countsError } = await fromExtendedTable(
    supabase,
    "post_counts"
  )
    .select("post_id, like_count, comment_count, share_count")
    .in("post_id", postIds);

  if (countsError) throw countsError;

  for (const row of counts ?? []) {
    const entry = result.get(row.post_id as string);
    if (!entry) continue;
    entry.likeCount = Number(row.like_count ?? 0);
    entry.commentCount = Number(row.comment_count ?? 0);
    entry.shareCount = Number(row.share_count ?? 0);
  }

  const { data: reactions, error: reactionsError } = await fromExtendedTable(
    supabase,
    "post_reactions"
  )
    .select("post_id")
    .eq("user_id", viewerUserId)
    .in("post_id", postIds);

  if (reactionsError) throw reactionsError;

  for (const row of reactions ?? []) {
    const entry = result.get(row.post_id as string);
    if (entry) entry.likedByMe = true;
  }

  return result;
}

export async function togglePostLike(
  supabase: SupabaseClient,
  userId: string,
  postId: string,
  actorName: string
): Promise<{ liked: boolean }> {
  const { data: existing, error: existingError } = await fromExtendedTable(
    supabase,
    "post_reactions"
  )
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) throw existingError;

  if (existing) {
    const { error } = await fromExtendedTable(supabase, "post_reactions")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    if (error) throw error;
    return { liked: false };
  }

  const { error } = await fromExtendedTable(supabase, "post_reactions").insert({
    post_id: postId,
    user_id: userId,
    reaction_type: "like",
  });
  if (error) throw error;

  await notifyPostAuthor(supabase, postId, userId, actorName, {
    title: `${actorName} curtiu sua publicação`,
    icon_name: "checkcircle2",
    color_token: "purple",
    href: "/dashboard/feed",
    action_label: "Ver publicação",
  });

  return { liked: true };
}

export async function fetchPostComments(
  supabase: SupabaseClient,
  postId: string
): Promise<FeedComment[]> {
  const { data, error } = await fromExtendedTable(supabase, "post_comments")
    .select(COMMENT_SELECT)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const comments = ((data ?? []) as DbCommentRow[]).map(mapComment);
  const topLevel = comments.filter((item) => !item.parentCommentId);
  const repliesByParent = new Map<string, FeedComment[]>();

  for (const comment of comments) {
    if (!comment.parentCommentId) continue;
    const list = repliesByParent.get(comment.parentCommentId) ?? [];
    list.push(comment);
    repliesByParent.set(comment.parentCommentId, list);
  }

  return topLevel.map((comment) => ({
    ...comment,
    replies: repliesByParent.get(comment.id) ?? [],
  }));
}

export async function createPostComment(
  supabase: SupabaseClient,
  userId: string,
  input: {
    postId: string;
    content: string;
    parentCommentId?: string | null;
    actorName: string;
  }
): Promise<FeedComment> {
  const content = input.content.trim();
  if (!content) throw new Error("Escreva um comentário.");

  if (input.parentCommentId) {
    const { data: parent, error: parentError } = await fromExtendedTable(
      supabase,
      "post_comments"
    )
      .select("id, parent_comment_id, post_id")
      .eq("id", input.parentCommentId)
      .maybeSingle();

    if (parentError) throw parentError;
    if (!parent || parent.post_id !== input.postId) {
      throw new Error("Comentário pai inválido.");
    }
    if (parent.parent_comment_id) {
      throw new Error("Respostas só podem ser feitas a comentários principais.");
    }
  }

  const { data, error } = await fromExtendedTable(supabase, "post_comments")
    .insert({
      post_id: input.postId,
      user_id: userId,
      parent_comment_id: input.parentCommentId ?? null,
      content,
    })
    .select(COMMENT_SELECT)
    .single();

  if (error) throw error;

  await notifyPostAuthor(supabase, input.postId, userId, input.actorName, {
    title: `${input.actorName} comentou sua publicação`,
    icon_name: "messagesquare",
    color_token: "blue",
    href: "/dashboard/feed",
    action_label: "Ver comentário",
  });

  return mapComment(data as DbCommentRow);
}

export async function updatePostComment(
  supabase: SupabaseClient,
  userId: string,
  commentId: string,
  content: string
): Promise<FeedComment> {
  const trimmed = content.trim();
  if (!trimmed) throw new Error("Escreva um comentário.");

  const { data, error } = await fromExtendedTable(supabase, "post_comments")
    .update({ content: trimmed })
    .eq("id", commentId)
    .eq("user_id", userId)
    .select(COMMENT_SELECT)
    .single();

  if (error) throw error;
  return mapComment(data as DbCommentRow);
}

export async function deletePostComment(
  supabase: SupabaseClient,
  userId: string,
  commentId: string
): Promise<void> {
  const { error } = await fromExtendedTable(supabase, "post_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function shareFeedPost(
  supabase: SupabaseClient,
  userId: string,
  input: { postId: string; comment?: string | null; actorName: string }
): Promise<FeedPost> {
  const { data: existingShare, error: existingError } = await fromExtendedTable(
    supabase,
    "post_shares"
  )
    .select("id")
    .eq("post_id", input.postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingShare) {
    throw new Error("Você já compartilhou esta publicação.");
  }

  const comment = input.comment?.trim() ?? "";

  const { data: feedPostRow, error: feedPostError } = await fromExtendedTable(
    supabase,
    "posts"
  )
    .insert({
      author_user_id: userId,
      content: comment,
      shared_post_id: input.postId,
      visibility: "public",
      media_urls: [],
    })
    .select(POST_SELECT)
    .single();

  if (feedPostError) throw feedPostError;

  const { error: shareError } = await fromExtendedTable(supabase, "post_shares").insert({
    post_id: input.postId,
    user_id: userId,
    comment: comment || null,
    feed_post_id: (feedPostRow as DbFeedPostRow).id,
  });

  if (shareError) throw shareError;

  await notifyPostAuthor(supabase, input.postId, userId, input.actorName, {
    title: `${input.actorName} compartilhou sua publicação`,
    icon_name: "send",
    color_token: "green",
    href: "/dashboard/feed",
    action_label: "Ver compartilhamento",
  });

  return mapFeedPostRow(feedPostRow as DbFeedPostRow, {
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    likedByMe: false,
  });
}
