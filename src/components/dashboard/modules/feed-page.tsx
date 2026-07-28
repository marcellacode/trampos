"use client";

import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PostCard } from "@/components/dashboard/feed/post-card";
import { PostComposer } from "@/components/dashboard/feed/post-composer";
import { Button } from "@/components/ui/button";
import { useCompanyMemberships } from "@/lib/crud/hooks";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { flattenFeedPages, useDeletePost, useFeed } from "@/lib/feed/hooks";

function shellLayoutProps(shell: ReturnType<typeof useDashboardShell>["shell"]) {
  return {
    user: shell.user,
    notifications: shell.notifications,
    unreadNotifications: shell.unreadNotifications,
    unreadMessages: shell.unreadMessages,
  };
}

export function FeedPage() {
  const { shell } = useDashboardShell();
  const feedQuery = useFeed();
  const deletePost = useDeletePost();
  const membershipsQuery = useCompanyMemberships();

  const posts = flattenFeedPages(feedQuery.data?.pages);
  const editableCompanyIds = (membershipsQuery.data ?? [])
    .filter((item) => item.role === "admin" || item.role === "recruiter")
    .map((item) => item.companyId);

  return (
    <DashboardLayout {...shellLayoutProps(shell)}>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Feed</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualizações profissionais e vagas compartilhadas pela comunidade
          </p>
        </header>

        <PostComposer
          userName={shell.user.name}
          userInitials={shell.user.initials}
        />

        {feedQuery.isLoading ? (
          <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Carregando feed…
          </div>
        ) : feedQuery.isError ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Não foi possível carregar o feed. Tente novamente.
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhuma publicação ainda. Seja o primeiro a compartilhar algo!
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
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
