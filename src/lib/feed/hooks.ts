"use client";

import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createPostAction,
  createPostCommentAction,
  deletePostAction,
  deletePostCommentAction,
  listFeedAction,
  listPostCommentsAction,
  sharePostAction,
  togglePostLikeAction,
  updatePostCommentAction,
} from "@/app/actions/feed";
import type { CreatePostActionInput, ListFeedActionResult } from "@/app/actions/feed";
import { getEngagementPostId } from "@/lib/supabase/queries/feed-mapper";
import { crudKeys } from "@/lib/crud/query-keys";
import type {
  CreateCommentInput,
  FeedComment,
  FeedMode,
  FeedPost,
  SharePostInput,
} from "@/types/feed";

export const feedKeys = {
  all: ["feed"] as const,
  list: (mode: FeedMode = "for_you") => [...feedKeys.all, "list", mode] as const,
  comments: (postId: string) => [...feedKeys.all, "comments", postId] as const,
};

type FeedInfiniteData = InfiniteData<ListFeedActionResult, string | null>;

function patchEngagement(
  post: FeedPost,
  engagementPostId: string,
  patch: Partial<Pick<FeedPost, "likeCount" | "commentCount" | "shareCount" | "likedByMe">>
): FeedPost {
  if (getEngagementPostId(post) !== engagementPostId) return post;

  const next: FeedPost = { ...post, ...patch };
  if (post.sharedPost) {
    next.sharedPost = { ...post.sharedPost, ...patch };
  }
  return next;
}

function updateFeedPosts(
  queryClient: ReturnType<typeof useQueryClient>,
  updater: (post: FeedPost) => FeedPost
) {
    queryClient.setQueriesData<FeedInfiniteData>(
      { queryKey: feedKeys.all },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.map(updater),
        })),
      };
    }
  );
}

export function useFeed(mode: FeedMode = "for_you") {
  return useInfiniteQuery({
    queryKey: feedKeys.list(mode),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const result = await listFeedAction({ cursor: pageParam, mode });
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

export function useTogglePostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (engagementPostId: string) => {
      const result = await togglePostLikeAction(engagementPostId);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (engagementPostId) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.all });

      updateFeedPosts(queryClient, (post) => {
        if (getEngagementPostId(post) !== engagementPostId) return post;
        const liked = !post.likedByMe;
        return patchEngagement(post, engagementPostId, {
          likedByMe: liked,
          likeCount: Math.max(0, post.likeCount + (liked ? 1 : -1)),
        });
      });

      return {};
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
      void queryClient.invalidateQueries({ queryKey: crudKeys.notifications });
    },
  });
}

export function usePostComments(postId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: feedKeys.comments(postId ?? ""),
    enabled: Boolean(postId && enabled),
    queryFn: async () => {
      const result = await listPostCommentsAction(postId!);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useCreatePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      const result = await createPostCommentAction(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.comments(input.postId) });
      await queryClient.cancelQueries({ queryKey: feedKeys.all });

      const optimistic: FeedComment = {
        id: `optimistic-${Date.now()}`,
        postId: input.postId,
        userId: "me",
        parentCommentId: input.parentCommentId ?? null,
        content: input.content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: "me",
          fullName: "Você",
          avatarUrl: null,
          avatarInitials: "V",
          slug: null,
          headline: "",
        },
        replies: [],
      };

      queryClient.setQueryData<FeedComment[]>(feedKeys.comments(input.postId), (old) => {
        const list = old ?? [];
        if (input.parentCommentId) {
          return list.map((comment) =>
            comment.id === input.parentCommentId
              ? { ...comment, replies: [...(comment.replies ?? []), optimistic] }
              : comment
          );
        }
        return [...list, optimistic];
      });

      updateFeedPosts(queryClient, (post) =>
        patchEngagement(post, input.postId, {
          commentCount: post.commentCount + 1,
        })
      );

      return { postId: input.postId };
    },
    onError: (_error, input) => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.comments(input.postId) });
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
    onSuccess: (comment, input) => {
      queryClient.setQueryData<FeedComment[]>(feedKeys.comments(input.postId), (old) => {
        if (!old) return [comment];
        const replaceOptimistic = (items: FeedComment[]): FeedComment[] =>
          items.map((item) => {
            if (item.id.startsWith("optimistic-")) {
              return item.postId === comment.postId &&
                item.parentCommentId === comment.parentCommentId
                ? comment
                : item;
            }
            return {
              ...item,
              replies: item.replies ? replaceOptimistic(item.replies) : [],
            };
          });

        if (input.parentCommentId) {
          return old.map((item) =>
            item.id === input.parentCommentId
              ? {
                  ...item,
                  replies: (item.replies ?? []).map((reply) =>
                    reply.id.startsWith("optimistic-") ? comment : reply
                  ),
                }
              : item
          );
        }

        return old.map((item) =>
          item.id.startsWith("optimistic-") ? comment : item
        );
      });
    },
    onSettled: (_data, _error, input) => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.comments(input.postId) });
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
      void queryClient.invalidateQueries({ queryKey: crudKeys.notifications });
    },
  });
}

export function useUpdatePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
      content,
    }: {
      commentId: string;
      postId: string;
      content: string;
    }) => {
      const result = await updatePostCommentAction(commentId, content);
      if (!result.success) throw new Error(result.error);
      return { comment: result.data, postId };
    },
    onMutate: async ({ commentId, postId, content }) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.comments(postId) });
      const previous = queryClient.getQueryData<FeedComment[]>(feedKeys.comments(postId));

      const patchList = (items: FeedComment[]): FeedComment[] =>
        items.map((item) => {
          if (item.id === commentId) {
            return { ...item, content: content.trim(), updatedAt: new Date().toISOString() };
          }
          return { ...item, replies: item.replies ? patchList(item.replies) : [] };
        });

      queryClient.setQueryData<FeedComment[]>(feedKeys.comments(postId), (old) =>
        old ? patchList(old) : old
      );

      return { previous, postId };
    },
    onError: (_error, { postId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(feedKeys.comments(postId), context.previous);
      }
    },
    onSettled: (_data, _error, { postId }) => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) });
    },
  });
}

export function useDeletePostComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: string;
      postId: string;
    }) => {
      const result = await deletePostCommentAction(commentId);
      if (!result.success) throw new Error(result.error);
      return postId;
    },
    onMutate: async ({ commentId, postId }) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.comments(postId) });
      await queryClient.cancelQueries({ queryKey: feedKeys.all });

      const removeFromList = (items: FeedComment[]): FeedComment[] =>
        items
          .filter((item) => item.id !== commentId)
          .map((item) => ({
            ...item,
            replies: item.replies ? removeFromList(item.replies) : [],
          }));

      queryClient.setQueryData<FeedComment[]>(feedKeys.comments(postId), (old) =>
        old ? removeFromList(old) : old
      );

      updateFeedPosts(queryClient, (post) =>
        patchEngagement(post, postId, {
          commentCount: Math.max(0, post.commentCount - 1),
        })
      );

      return { postId };
    },
    onError: (_error, { postId }) => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) });
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
    onSettled: (postId) => {
      if (postId) {
        void queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) });
        void queryClient.invalidateQueries({ queryKey: feedKeys.all });
      }
    },
  });
}

export function useSharePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SharePostInput) => {
      const result = await sharePostAction(input);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.all });

      updateFeedPosts(queryClient, (post) =>
        patchEngagement(post, input.postId, {
          shareCount: post.shareCount + 1,
        })
      );

      return {};
    },
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
      void queryClient.invalidateQueries({ queryKey: crudKeys.notifications });
    },
  });
}

export function flattenFeedPages(
  pages: Array<{ posts: FeedPost[] }> | undefined
): FeedPost[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.posts);
}
