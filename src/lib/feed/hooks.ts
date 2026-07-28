"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createPostAction,
  deletePostAction,
  listFeedAction,
} from "@/app/actions/feed";
import type { CreatePostActionInput } from "@/app/actions/feed";
import type { FeedPost } from "@/types/feed";

export const feedKeys = {
  all: ["feed"] as const,
  list: () => [...feedKeys.all, "list"] as const,
};

export function useFeed() {
  return useInfiniteQuery({
    queryKey: feedKeys.list(),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const result = await listFeedAction({ cursor: pageParam });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursorEncoded,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePostActionInput) => {
      const result = await createPostAction(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const result = await deletePostAction(postId);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
  });
}

export function flattenFeedPages(
  pages: Array<{ posts: FeedPost[] }> | undefined
): FeedPost[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.posts);
}
