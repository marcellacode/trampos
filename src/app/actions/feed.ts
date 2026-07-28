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
import type { CreatePostInput, FeedPage, PostVisibility } from "@/types/feed";

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado. Tente novamente.";
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
}

export interface ListFeedActionResult extends FeedPage {
  nextCursorEncoded: string | null;
}

export async function listFeedAction(
  input: ListFeedActionInput = {}
): Promise<ActionResult<ListFeedActionResult>> {
  try {
    const { supabase } = await requireAuth();
    const cursor = decodeFeedCursor(input.cursor);
    const page = await fetchFeedPosts(supabase, {
      cursor,
      limit: input.limit,
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
