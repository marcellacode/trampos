"use client";

import Link from "next/link";
import { Building2, Trash2, User } from "lucide-react";
import { FeedJobMiniCard } from "@/components/dashboard/feed/feed-job-mini-card";
import { Button } from "@/components/ui/button";
import { formatPostTimestamp } from "@/lib/supabase/queries/feed";
import type { FeedPost } from "@/types/feed";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: FeedPost;
  currentUserId?: string;
  editableCompanyIds?: string[];
  onDelete?: (postId: string) => void;
  isDeleting?: boolean;
  className?: string;
}

function AuthorAvatar({
  post,
}: {
  post: FeedPost;
}) {
  if (post.authorCompany) {
    const { name, logo, brandColor } = post.authorCompany;
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        style={{ backgroundColor: `${brandColor}22`, color: brandColor }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-full w-full rounded-full object-cover" />
        ) : (
          <Building2 className="h-4 w-4" aria-hidden="true" />
        )}
      </div>
    );
  }

  const user = post.authorUser;
  if (!user) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        user.avatarInitials
      )}
    </div>
  );
}

function AuthorName({ post }: { post: FeedPost }) {
  if (post.authorCompany) {
    return (
      <Link
        href={`/empresa/${post.authorCompany.slug}`}
        className="font-semibold text-foreground hover:underline"
      >
        {post.authorCompany.name}
      </Link>
    );
  }

  if (post.authorUser?.slug) {
    return (
      <Link
        href={`/perfil/${post.authorUser.slug}`}
        className="font-semibold text-foreground hover:underline"
      >
        {post.authorUser.fullName}
      </Link>
    );
  }

  return (
    <span className="font-semibold text-foreground">
      {post.authorUser?.fullName ?? "Usuário"}
    </span>
  );
}

export function PostCard({
  post,
  currentUserId,
  editableCompanyIds = [],
  onDelete,
  isDeleting = false,
  className,
}: PostCardProps) {
  const canDelete =
    (post.authorUser?.id === currentUserId) ||
    (post.authorCompany != null &&
      editableCompanyIds.includes(post.authorCompany.id));

  const subtitle =
    post.authorUser?.headline ||
    (post.authorCompany ? "Empresa" : null);

  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-card p-4 sm:p-5",
        className
      )}
    >
      <div className="flex gap-3">
        <AuthorAvatar post={post} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <AuthorName post={post} />
              {subtitle ? (
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
              <time
                dateTime={post.createdAt}
                className="text-xs text-muted-foreground"
              >
                {formatPostTimestamp(post.createdAt)}
              </time>
            </div>
            {canDelete && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(post.id)}
                disabled={isDeleting}
                aria-label="Excluir publicação"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          {post.content ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
              {post.content}
            </p>
          ) : null}

          {post.job ? <FeedJobMiniCard job={post.job} /> : null}
        </div>
      </div>
    </article>
  );
}
