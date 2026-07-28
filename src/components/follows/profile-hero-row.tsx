"use client";

import { useState, type ReactNode } from "react";
import { ExternalLink, Globe, MapPin } from "lucide-react";
import { FollowButton } from "@/components/follows/follow-button";

interface ProfileHeroRowProps {
  avatar: ReactNode;
  nameBlock: ReactNode;
  profileId: string;
  profileSlug: string;
  location: string;
  websiteUrl: string | null;
  websiteHref: string | null;
  initialIsFollowing: boolean;
  initialFollowerCount: number;
  initialFollowingCount: number;
  isAuthenticated: boolean;
  isOwner: boolean;
}

export function ProfileHeroRow({
  avatar,
  nameBlock,
  profileId,
  profileSlug,
  location,
  websiteUrl,
  websiteHref,
  initialIsFollowing,
  initialFollowerCount,
  initialFollowingCount,
  isAuthenticated,
  isOwner,
}: ProfileHeroRowProps) {
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);

  return (
    <div className="relative -mt-16 flex flex-col gap-4 px-1 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-end gap-4">
        {avatar}
        <div className="pb-1">
          {nameBlock}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              {followerCount} seguidor{followerCount === 1 ? "" : "es"}
            </span>
            <span>{initialFollowingCount} seguindo</span>
            {location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {location}
              </span>
            ) : null}
            {websiteHref ? (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                {websiteUrl}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <FollowButton
        targetType="user"
        targetId={profileId}
        initialIsFollowing={initialIsFollowing}
        isAuthenticated={isAuthenticated}
        isOwner={isOwner}
        revalidateSlug={profileSlug}
        onFollowerCountChange={setFollowerCount}
      />
    </div>
  );
}
