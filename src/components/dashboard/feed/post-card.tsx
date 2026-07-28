"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Repeat2,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { blockUserAction, reportPostAction } from "@/app/actions/moderation";
import { FeedJobMiniCard } from "@/components/dashboard/feed/feed-job-mini-card";
import { Button } from "@/components/ui/button";
import {
  useCreatePostComment,
  useDeletePostComment,
  usePostComments,
  useSharePost,
  useTogglePostLike,
  useUpdatePostComment,
} from "@/lib/feed/hooks";
import { getEngagementPostId } from "@/lib/supabase/queries/feed-mapper";
import { formatPostTimestamp } from "@/lib/supabase/queries/feed";
import type { FeedComment, FeedPost } from "@/types/feed";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: FeedPost;
  currentUserId?: string;
  currentUserName?: string;
  currentUserInitials?: string;
  editableCompanyIds?: string[];
  onDelete?: (postId: string) => void;
  isDeleting?: boolean;
  className?: string;
}

function AuthorAvatar({ post, size = "md" }: { post: FeedPost; size?: "md" | "sm" }) {
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  if (post.authorCompany) {
    const { logo, brandColor, name } = post.authorCompany;
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-bold",
          dim
        )}
        style={{ backgroundColor: `${brandColor}22`, color: brandColor }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={name} className="h-full w-full rounded-full object-cover" />
        ) : (
          name.slice(0, 1)
        )}
      </div>
    );
  }

  const user = post.authorUser;
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
        dim
      )}
    >
      {user?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        user?.avatarInitials ?? "U"
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

function EmbeddedPost({ post }: { post: FeedPost }) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex gap-2">
        <AuthorAvatar post={post} size="sm" />
        <div className="min-w-0 flex-1">
          <AuthorName post={post} />
          {post.content ? (
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{post.content}</p>
          ) : null}
          {post.job ? <FeedJobMiniCard job={post.job} /> : null}
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  postId,
  currentUserId,
}: {
  comment: FeedComment;
  postId: string;
  currentUserId?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const updateComment = useUpdatePostComment();
  const deleteComment = useDeletePostComment();
  const isAuthor = comment.userId === currentUserId;

  function saveEdit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    updateComment.mutate(
      { commentId: comment.id, postId, content: trimmed },
      { onSuccess: () => setEditing(false) }
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
          {comment.author.avatarInitials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-sm font-medium">{comment.author.fullName}</span>
              <time
                dateTime={comment.createdAt}
                className="ml-2 text-xs text-muted-foreground"
              >
                {formatPostTimestamp(comment.createdAt)}
              </time>
            </div>
            {isAuthor ? (
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setDraft(comment.content);
                    setEditing((value) => !value);
                  }}
                  aria-label="Editar comentário"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteComment.mutate({ commentId: comment.id, postId })}
                  aria-label="Excluir comentário"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </div>
          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                className="w-full resize-none rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={saveEdit} disabled={updateComment.isPending}>
                  Salvar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{comment.content}</p>
          )}
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <div key={reply.id} className="ml-9">
          <CommentItem comment={reply} postId={postId} currentUserId={currentUserId} />
        </div>
      ))}
    </div>
  );
}

function PostCommentsSection({
  postId,
  currentUserId,
  open,
}: {
  postId: string;
  currentUserId?: string;
  open: boolean;
}) {
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const commentsQuery = usePostComments(postId, open);
  const createComment = useCreatePostComment();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    createComment.mutate(
      { postId, content: trimmed, parentCommentId: replyTo },
      {
        onSuccess: () => {
          setContent("");
          setReplyTo(null);
        },
      }
    );
  }

  if (!open) return null;

  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      {commentsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando comentários…</p>
      ) : commentsQuery.isError ? (
        <p className="text-sm text-destructive">Não foi possível carregar comentários.</p>
      ) : (commentsQuery.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum comentário ainda.</p>
      ) : (
        <div className="space-y-4">
          {(commentsQuery.data ?? []).map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                postId={postId}
                currentUserId={currentUserId}
              />
              {currentUserId ? (
                <button
                  type="button"
                  className="ml-9 mt-1 text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setReplyTo(comment.id)}
                >
                  Responder
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          {replyTo ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Respondendo a um comentário</span>
              <button type="button" onClick={() => setReplyTo(null)}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={2}
            placeholder="Escreva um comentário…"
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <Button type="submit" size="sm" disabled={createComment.isPending}>
            {createComment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Comentar"
            )}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function ShareForm({
  postId,
  onClose,
}: {
  postId: string;
  onClose: () => void;
}) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const sharePost = useSharePost();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    sharePost.mutate(
      { postId, comment: comment.trim() || null },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-lg border border-border bg-muted/20 p-3">
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={2}
        placeholder="Adicione um comentário (opcional)…"
        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={sharePost.isPending}>
          {sharePost.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              Compartilhar no feed
            </>
          )}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
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
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moderationMessage, setModerationMessage] = useState<string | null>(null);
  const toggleLike = useTogglePostLike();

  const engagementPostId = getEngagementPostId(post);
  const isShareRepost = Boolean(post.sharedPost);

  const canDelete =
    (post.authorUser?.id === currentUserId) ||
    (post.authorCompany != null &&
      editableCompanyIds.includes(post.authorCompany.id));

  const canModerate =
    post.authorUser?.id &&
    post.authorUser.id !== currentUserId &&
    currentUserId;

  async function handleReport() {
    const result = await reportPostAction({
      postId: post.id,
      reason: "Conteúdo inadequado",
    });
    setMenuOpen(false);
    setModerationMessage(
      result.success ? "Denúncia registrada. Obrigado." : result.error
    );
  }

  async function handleBlock() {
    if (!post.authorUser?.id) return;
    const result = await blockUserAction(post.authorUser.id);
    setMenuOpen(false);
    setModerationMessage(
      result.success
        ? "Usuário bloqueado. Você não verá mais publicações dele."
        : result.error
    );
  }

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
              {isShareRepost ? (
                <p className="text-xs text-muted-foreground">compartilhou uma publicação</p>
              ) : subtitle ? (
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
            ) : canModerate ? (
              <div className="relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0"
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-label="Mais opções"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                {menuOpen ? (
                  <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-border bg-card py-1 shadow-lg">
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-muted/50"
                      onClick={() => void handleReport()}
                    >
                      Denunciar
                    </button>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-muted/50"
                      onClick={() => void handleBlock()}
                    >
                      Bloquear usuário
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {post.postSource === "system" ? (
            <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Conquista automática
            </p>
          ) : null}

          {moderationMessage ? (
            <p className="mt-2 text-xs text-muted-foreground">{moderationMessage}</p>
          ) : null}

          {post.content ? (
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
              {post.content}
            </p>
          ) : null}

          {post.sharedPost ? <EmbeddedPost post={post.sharedPost} /> : null}
          {!post.sharedPost && post.job ? <FeedJobMiniCard job={post.job} /> : null}

          <div className="mt-4 flex flex-wrap items-center gap-1 border-t border-border pt-3">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-muted/60",
                post.likedByMe ? "text-primary" : "text-muted-foreground"
              )}
              onClick={() => toggleLike.mutate(engagementPostId)}
              disabled={!currentUserId || toggleLike.isPending}
            >
              <Heart
                className={cn("h-4 w-4", post.likedByMe && "fill-current")}
                aria-hidden="true"
              />
              <span>{post.likeCount > 0 ? post.likeCount : "Curtir"}</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60"
              onClick={() => {
                setCommentsOpen((value) => !value);
                setShareOpen(false);
              }}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>{post.commentCount > 0 ? post.commentCount : "Comentar"}</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60"
              onClick={() => {
                setShareOpen((value) => !value);
                setCommentsOpen(false);
              }}
              disabled={!currentUserId}
            >
              <Repeat2 className="h-4 w-4" aria-hidden="true" />
              <span>{post.shareCount > 0 ? post.shareCount : "Compartilhar"}</span>
            </button>
          </div>

          {shareOpen ? (
            <ShareForm
              postId={engagementPostId}
              onClose={() => setShareOpen(false)}
            />
          ) : null}

          <PostCommentsSection
            postId={engagementPostId}
            currentUserId={currentUserId}
            open={commentsOpen}
          />
        </div>
      </div>
    </article>
  );
}
