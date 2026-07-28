"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/app/actions/ai";
import { AuthError, requireAuth } from "@/lib/auth/require-auth";
import {
  createFeedPost,
  decodeFeedCursor,
  deleteFeedPost,
  encodeFeedCursor,
  fetchFeedPosts,
} from "@/lib/supabase/queries/feed";
import {
  createPostComment,
  deletePostComment,
  fetchPostComments,
  shareFeedPost,
  togglePostLike,
  updatePostComment,
} from "@/lib/supabase/queries/post-engagement";
import type {
  CreateCommentInput,
  CreatePostInput,
  FeedComment,
  FeedPage,
  FeedPost,
  PostVisibility,
  SharePostInput,
} from "@/types/feed";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
}

async function getActorName(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, first_name")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.full_name || data?.first_name || "Alguém";
}

export interface CreatePostActionInput {
  content: string;
  visibility?: PostVisibility;
  jobId?: string | null;
  authorCompanyId?: string | null;
}

export interface ListFeedActionInput {
  cursor?: string | null;
  limit?: number;
  mode?: "for_you" | "explore";
}

export interface ListFeedActionResult extends FeedPage {
  nextCursorEncoded: string | null;
}

export async function listFeedAction(
  input: ListFeedActionInput = {}
): Promise<ActionResult<ListFeedActionResult>> {
  try {
    const { supabase, user } = await requireAuth();
    const cursor = decodeFeedCursor(input.cursor);
    const page = await fetchFeedPosts(supabase, {
      cursor,
      limit: input.limit,
      viewerUserId: user.id,
      mode: input.mode ?? "for_you",
    });

    return {
      success: true,
      data: {
        ...page,
        nextCursorEncoded: page.nextCursor
          ? encodeFeedCursor(page.nextCursor)
          : null,
      },
    };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createPostAction(
  input: CreatePostActionInput
): Promise<ActionResult<{ postId: string }>> {
  try {
    const { supabase, user } = await requireAuth();
    const payload: CreatePostInput = {
      content: input.content,
      visibility: input.visibility ?? "public",
      jobId: input.jobId ?? null,
      authorCompanyId: input.authorCompanyId ?? null,
    };

    const post = await createFeedPost(supabase, user.id, payload);
    revalidatePath("/dashboard/feed");

    return { success: true, data: { postId: post.id } };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deletePostAction(
  postId: string
): Promise<ActionResult<void>> {
  try {
    const { supabase } = await requireAuth();
    await deleteFeedPost(supabase, postId);
    revalidatePath("/dashboard/feed");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function togglePostLikeAction(
  postId: string
): Promise<ActionResult<{ liked: boolean }>> {
  try {
    const { supabase, user } = await requireAuth();
    const actorName = await getActorName(supabase, user.id);
    const result = await togglePostLike(supabase, user.id, postId, actorName);
    revalidatePath("/dashboard/feed");
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function listPostCommentsAction(
  postId: string
): Promise<ActionResult<FeedComment[]>> {
  try {
    const { supabase } = await requireAuth();
    const comments = await fetchPostComments(supabase, postId);
    return { success: true, data: comments };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function createPostCommentAction(
  input: CreateCommentInput
): Promise<ActionResult<FeedComment>> {
  try {
    const { supabase, user } = await requireAuth();
    const actorName = await getActorName(supabase, user.id);
    const comment = await createPostComment(supabase, user.id, {
      ...input,
      actorName,
    });
    revalidatePath("/dashboard/feed");
    return { success: true, data: comment };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updatePostCommentAction(
  commentId: string,
  content: string
): Promise<ActionResult<FeedComment>> {
  try {
    const { supabase, user } = await requireAuth();
    const comment = await updatePostComment(supabase, user.id, commentId, content);
    revalidatePath("/dashboard/feed");
    return { success: true, data: comment };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deletePostCommentAction(
  commentId: string
): Promise<ActionResult<void>> {
  try {
    const { supabase, user } = await requireAuth();
    await deletePostComment(supabase, user.id, commentId);
    revalidatePath("/dashboard/feed");
    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function sharePostAction(
  input: SharePostInput
): Promise<ActionResult<FeedPost>> {
  try {
    const { supabase, user } = await requireAuth();
    const actorName = await getActorName(supabase, user.id);
    const post = await shareFeedPost(supabase, user.id, {
      ...input,
      actorName,
    });
    revalidatePath("/dashboard/feed");
    return { success: true, data: post };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
