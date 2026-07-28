"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listFollowersAction,
  listFollowingAction,
  listFollowSuggestionsAction,
  toggleFollowAction,
} from "@/app/actions/follows";
import { feedKeys } from "@/lib/feed/hooks";
import { invalidateCareerQueries } from "@/lib/career/invalidate";
import type { FollowTargetType, ToggleFollowResult } from "@/types/follows";

export const followKeys = {
  all: ["follows"] as const,
  following: () => [...followKeys.all, "following"] as const,
  followers: () => [...followKeys.all, "followers"] as const,
  suggestions: () => [...followKeys.all, "suggestions"] as const,
  status: (targetType: FollowTargetType, targetId: string) =>
    [...followKeys.all, "status", targetType, targetId] as const,
};

export function useFollowingList() {
  return useQuery({
    queryKey: followKeys.following(),
    queryFn: async () => {
      const result = await listFollowingAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useFollowersList() {
  return useQuery({
    queryKey: followKeys.followers(),
    queryFn: async () => {
      const result = await listFollowersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useFollowSuggestions() {
  return useQuery({
    queryKey: followKeys.suggestions(),
    queryFn: async () => {
      const result = await listFollowSuggestionsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useToggleFollow(options?: {
  targetType: FollowTargetType;
  targetId: string;
  revalidateSlug?: string;
  onOptimisticUpdate?: (result: ToggleFollowResult) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input?: {
      targetType?: FollowTargetType;
      targetId?: string;
      revalidateSlug?: string;
    }) => {
      const targetType = input?.targetType ?? options?.targetType;
      const targetId = input?.targetId ?? options?.targetId;
      const revalidateSlug = input?.revalidateSlug ?? options?.revalidateSlug;

      if (!targetType || !targetId) {
        throw new Error("Alvo de follow inválido.");
      }

      const result = await toggleFollowAction({
        targetType,
        targetId,
        revalidateSlug,
      });
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: followKeys.all });

      const previousFollowing = queryClient.getQueryData(followKeys.following());
      const previousFollowers = queryClient.getQueryData(followKeys.followers());
      const previousSuggestions = queryClient.getQueryData(followKeys.suggestions());

      return { previousFollowing, previousFollowers, previousSuggestions };
    },
    onSuccess: (data) => {
      options?.onOptimisticUpdate?.(data);
    },
    onError: (_error, _input, context) => {
      if (context?.previousFollowing) {
        queryClient.setQueryData(followKeys.following(), context.previousFollowing);
      }
      if (context?.previousFollowers) {
        queryClient.setQueryData(followKeys.followers(), context.previousFollowers);
      }
      if (context?.previousSuggestions) {
        queryClient.setQueryData(followKeys.suggestions(), context.previousSuggestions);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: followKeys.all });
      void queryClient.invalidateQueries({ queryKey: feedKeys.all });
      invalidateCareerQueries(queryClient);
    },
  });
}
