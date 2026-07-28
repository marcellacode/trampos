"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCompanyJobsForRecruiter, useCompanyMemberships } from "@/lib/crud/hooks";
import { useCreatePost } from "@/lib/feed/hooks";
import type { PostVisibility } from "@/types/feed";
import { cn } from "@/lib/utils";

interface PostComposerProps {
  userName: string;
  userInitials: string;
  className?: string;
}

type AuthorMode = "user" | "company";

export function PostComposer({ userName, userInitials, className }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [authorMode, setAuthorMode] = useState<AuthorMode>("user");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const membershipsQuery = useCompanyMemberships();
  const memberships = membershipsQuery.data ?? [];
  const editableMemberships = memberships.filter(
    (item) => item.role === "admin" || item.role === "recruiter"
  );

  useEffect(() => {
    if (authorMode === "company" && !companyId && editableMemberships.length > 0) {
      setCompanyId(editableMemberships[0].companyId);
    }
  }, [authorMode, companyId, editableMemberships]);

  const jobsQuery = useCompanyJobsForRecruiter(
    authorMode === "company" ? companyId : null
  );
  const activeJobs = (jobsQuery.data ?? []).filter(
    (job) => job.is_active && job.application_mode === "internal"
  );

  const createPost = useCreatePost();

  function resetForm() {
    setContent("");
    setJobId(null);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = content.trim();
    if (!trimmed && !jobId) {
      setError("Escreva algo ou selecione uma vaga para compartilhar.");
      return;
    }

    createPost.mutate(
      {
        content: trimmed,
        visibility,
        jobId,
        authorCompanyId: authorMode === "company" ? companyId : null,
      },
      {
        onSuccess: () => resetForm(),
        onError: (err) => setError(err.message),
      }
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-xl border border-border bg-card p-4 sm:p-5",
        className
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {authorMode === "company" ? (
            <Building2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            userInitials || <User className="h-4 w-4" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          {editableMemberships.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthorMode("user");
                  setJobId(null);
                }}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  authorMode === "user"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/50"
                )}
              >
                {userName}
              </button>
              {editableMemberships.map((membership) => (
                <button
                  key={membership.companyId}
                  type="button"
                  onClick={() => {
                    setAuthorMode("company");
                    setCompanyId(membership.companyId);
                    setJobId(null);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    authorMode === "company" && companyId === membership.companyId
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {membership.company.name}
                </button>
              ))}
            </div>
          ) : null}

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={3}
            placeholder={
              authorMode === "company"
                ? "Compartilhe novidades da empresa…"
                : "Compartilhe uma atualização profissional…"
            }
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm"
          />

          {authorMode === "company" && activeJobs.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="feed-job-select">Compartilhar vaga (opcional)</Label>
              <select
                id="feed-job-select"
                value={jobId ?? ""}
                onChange={(event) =>
                  setJobId(event.target.value ? event.target.value : null)
                }
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Nenhuma vaga</option>
                {activeJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as PostVisibility)
              }
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs"
              aria-label="Visibilidade da publicação"
            >
              <option value="public">Público</option>
              <option value="followers">Seguidores</option>
            </select>

            <Button type="submit" size="sm" disabled={createPost.isPending}>
              {createPost.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Publicar
                </>
              )}
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>
    </form>
  );
}
