"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToggleFollow } from "@/lib/follows/hooks";
import type { FollowTargetType } from "@/types/follows";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  targetType: FollowTargetType;
  targetId: string;
  initialIsFollowing: boolean;
  initialFollowerCount?: number;
  isAuthenticated: boolean;
  isOwner?: boolean;
  revalidateSlug?: string;
  className?: string;
  labelFollowing?: string;
  labelFollow?: string;
  onFollowerCountChange?: (count: number) => void;
}

export function FollowButton({
  targetType,
  targetId,
  initialIsFollowing,
  initialFollowerCount,
  isAuthenticated,
  isOwner = false,
  revalidateSlug,
  className,
  labelFollowing = "Seguindo",
  labelFollow = targetType === "company" ? "Seguir empresa" : "Seguir",
  onFollowerCountChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount ?? 0);

  const toggleFollow = useToggleFollow({
    targetType,
    targetId,
    revalidateSlug,
    onOptimisticUpdate: (result) => {
      setIsFollowing(result.isFollowing);
      setFollowerCount(result.followerCount);
      onFollowerCountChange?.(result.followerCount);
    },
  });

  if (isOwner) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className={cn("flex flex-col items-end gap-1", className)}>
        <Button variant="outline" size="sm" render={<Link href="/login" />}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {labelFollow}
        </Button>
        {initialFollowerCount != null ? (
          <span className="text-xs text-muted-foreground">
            {followerCount} seguidor{followerCount === 1 ? "" : "es"}
          </span>
        ) : null}
      </div>
    );
  }

  const handleClick = () => {
    const prevFollowing = isFollowing;
    const prevCount = followerCount;
    const nextFollowing = !isFollowing;

    setIsFollowing(nextFollowing);
    const nextCount = Math.max(0, followerCount + (nextFollowing ? 1 : -1));
    setFollowerCount(nextCount);
    onFollowerCountChange?.(nextCount);

    toggleFollow.mutate(undefined, {
      onError: () => {
        setIsFollowing(prevFollowing);
        setFollowerCount(prevCount);
        onFollowerCountChange?.(prevCount);
      },
    });
  };

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <Button
        type="button"
        variant={isFollowing ? "secondary" : "default"}
        size="sm"
        className="w-fit"
        onClick={handleClick}
        disabled={toggleFollow.isPending}
      >
        {toggleFollow.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isFollowing ? (
          <UserCheck className="h-4 w-4" aria-hidden="true" />
        ) : (
          <UserPlus className="h-4 w-4" aria-hidden="true" />
        )}
        {isFollowing ? labelFollowing : labelFollow}
      </Button>
      {initialFollowerCount != null ? (
        <span className="text-xs text-muted-foreground">
          {followerCount} seguidor{followerCount === 1 ? "" : "es"}
        </span>
      ) : null}
    </div>
  );
}
