"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PostCard } from "@/components/dashboard/feed/post-card";
import {
  ActivityFeedCard,
  AiTipFeedCard,
  JobRecommendationFeedCard,
} from "@/components/dashboard/feed/career-feed-cards";
import { PostComposer } from "@/components/dashboard/feed/post-composer";
import { GuidedEmptyStateView } from "@/components/dashboard/guided-empty-state";
import { Button } from "@/components/ui/button";
import { useCareerContext } from "@/lib/career/hooks";
import { getFeedGuidedEmptyState } from "@/lib/career/guided-empty-states";
import { useCompanyMemberships } from "@/lib/crud/hooks";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { flattenFeedPages, useDeletePost, useFeed } from "@/lib/feed/hooks";
import { mergeUnifiedFeed, type FeedItem } from "@/lib/feed/unified-feed";
import type { FeedMode, FeedPost } from "@/types/feed";
import type { CareerActivity } from "@/types/career-context";
import type { AISuggestion, JobCard } from "@/types/dashboard";

function shellLayoutProps(shell: ReturnType<typeof useDashboardShell>["shell"]) {
  return {
    user: shell.user,
    notifications: shell.notifications,
    unreadNotifications: shell.unreadNotifications,
    unreadMessages: shell.unreadMessages,
  };
}

const FEED_TABS: { id: FeedMode; label: string }[] = [
  { id: "for_you", label: "Para você" },
  { id: "explore", label: "Explorar" },
];

function FeedItemRenderer({
  item,
  currentUserId,
  editableCompanyIds,
  onDelete,
  isDeleting,
}: {
  item: FeedItem;
  currentUserId: string;
  editableCompanyIds: string[];
  onDelete: (postId: string) => void;
  isDeleting: boolean;
}) {
  switch (item.type) {
    case "post":
      return (
        <PostCard
          post={item.data as FeedPost}
          currentUserId={currentUserId}
          editableCompanyIds={editableCompanyIds}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      );
    case "activity":
      return <ActivityFeedCard activity={item.data as CareerActivity} />;
    case "job_recommendation":
      return <JobRecommendationFeedCard job={item.data as JobCard} />;
    case "ai_tip":
      return <AiTipFeedCard suggestion={item.data as AISuggestion} />;
    default:
      return null;
  }
}

export function FeedPage() {
  const { shell } = useDashboardShell();
  const { context, isLoading: careerLoading } = useCareerContext();
  const [mode, setMode] = useState<FeedMode>("for_you");
  const feedQuery = useFeed(mode);
  const deletePost = useDeletePost();
  const membershipsQuery = useCompanyMemberships();

  const posts = flattenFeedPages(feedQuery.data?.pages);
  const editableCompanyIds = (membershipsQuery.data ?? [])
    .filter((item) => item.role === "admin" || item.role === "recruiter")
    .map((item) => item.companyId);

  const unifiedItems = useMemo(() => {
    if (mode !== "for_you" || !context) {
      return posts.map(
        (post): FeedItem => ({
          id: `post-${post.id}`,
          type: "post",
          createdAt: post.createdAt,
          data: post,
        })
      );
    }

    return mergeUnifiedFeed({
      posts,
      activities: context.recentActivity,
      topJobs: context.matchInsights.topJobs,
      aiTips: context.aiSuggestions,
    });
  }, [mode, posts, context]);

  const showGuidedEmpty =
    !feedQuery.isLoading &&
    !careerLoading &&
    unifiedItems.length === 0 &&
    context;

  return (
    <DashboardLayout {...shellLayoutProps(shell)}>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Feed</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atividades, vagas relevantes, dicas de carreira e publicações
          </p>
        </header>

        <div
          className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1"
          role="tablist"
          aria-label="Modo do feed"
        >
          {FEED_TABS.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mode === tab.id}
              variant={mode === tab.id ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setMode(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <PostComposer
          userName={shell.user.name}
          userInitials={shell.user.initials}
        />

        {feedQuery.isLoading || careerLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Carregando feed…
          </div>
        ) : feedQuery.isError ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Não foi possível carregar o feed. Tente novamente.
          </div>
        ) : showGuidedEmpty ? (
          <GuidedEmptyStateView {...getFeedGuidedEmptyState(context)} />
        ) : (
          <div className="space-y-4">
            {unifiedItems.map((item) => (
              <FeedItemRenderer
                key={item.id}
                item={item}
                currentUserId={shell.user.id}
                editableCompanyIds={editableCompanyIds}
                onDelete={(postId) => deletePost.mutate(postId)}
                isDeleting={deletePost.isPending}
              />
            ))}
          </div>
        )}

        {feedQuery.hasNextPage ? (
          <div className="flex justify-center pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => void feedQuery.fetchNextPage()}
              disabled={feedQuery.isFetchingNextPage}
            >
              {feedQuery.isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Carregando…
                </>
              ) : (
                "Carregar mais"
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
