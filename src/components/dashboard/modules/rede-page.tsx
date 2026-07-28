"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Building2, Loader2, MapPin, Users } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { FollowButton } from "@/components/follows/follow-button";
import { GuidedEmptyStateView } from "@/components/dashboard/guided-empty-state";
import { Button } from "@/components/ui/button";
import { useCareerContext } from "@/lib/career/hooks";
import { getRedeGuidedEmptyState } from "@/lib/career/guided-empty-states";
import {
  useFollowersList,
  useFollowingList,
  useFollowSuggestions,
} from "@/lib/follows/hooks";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import type { FollowCompanySummary, FollowUserSummary } from "@/types/follows";
import { cn } from "@/lib/utils";

type RedeTab = "following" | "followers" | "suggestions";

const TABS: { id: RedeTab; label: string }[] = [
  { id: "suggestions", label: "Descobrir" },
  { id: "following", label: "Seguindo" },
  { id: "followers", label: "Seguidores" },
];

function shellLayoutProps(shell: ReturnType<typeof useDashboardShell>["shell"]) {
  return {
    user: shell.user,
    notifications: shell.notifications,
    unreadNotifications: shell.unreadNotifications,
    unreadMessages: shell.unreadMessages,
  };
}

function UserAvatar({
  user,
  size = "md",
}: {
  user: FollowUserSummary;
  size?: "md" | "sm";
}) {
  const sizeClass = size === "md" ? "h-12 w-12" : "h-10 w-10";

  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        className={cn(sizeClass, "rounded-xl object-cover")}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        "flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-sm font-semibold text-primary-foreground"
      )}
    >
      {user.avatarInitials}
    </div>
  );
}

function UserListItem({
  user,
  showFollowButton = true,
}: {
  user: FollowUserSummary;
  showFollowButton?: boolean;
}) {
  const profileHref = user.slug ? `/perfil/${user.slug}` : "#";

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4">
      <Link href={profileHref} className="shrink-0">
        <UserAvatar user={user} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={profileHref}
          className="block truncate font-medium text-foreground hover:underline"
        >
          {user.fullName}
        </Link>
        <p className="truncate text-sm text-muted-foreground">
          {user.headline || "Profissional"}
        </p>
        {user.location ? (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {user.location}
          </p>
        ) : null}
      </div>
      {showFollowButton && user.slug ? (
        <FollowButton
          targetType="user"
          targetId={user.id}
          initialIsFollowing={user.isFollowing}
          isAuthenticated
          revalidateSlug={user.slug}
          className="shrink-0"
        />
      ) : null}
    </li>
  );
}

function CompanyListItem({ company }: { company: FollowCompanySummary }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-4">
      <Link href={`/empresa/${company.slug}`} className="shrink-0">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold"
          style={{
            backgroundColor: `${company.brandColor}22`,
            color: company.brandColor,
          }}
        >
          {company.logo}
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/empresa/${company.slug}`}
          className="block truncate font-medium text-foreground hover:underline"
        >
          {company.name}
        </Link>
        <p className="truncate text-sm text-muted-foreground">{company.segment}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {company.followerCount} seguidor{company.followerCount === 1 ? "" : "es"}
        </p>
      </div>
      <FollowButton
        targetType="company"
        targetId={company.id}
        initialIsFollowing={company.isFollowing}
        initialFollowerCount={company.followerCount}
        isAuthenticated
        revalidateSlug={company.slug}
        labelFollow="Seguir"
        className="shrink-0"
      />
    </li>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[30vh] items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      Carregando…
    </div>
  );
}

function EmptyState({
  message,
  guided,
}: {
  message: string;
  guided?: ReactNode;
}) {
  if (guided) return <>{guided}</>;
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function FollowingTab({ guidedEmpty }: { guidedEmpty?: ReactNode }) {
  const followingQuery = useFollowingList();

  if (followingQuery.isLoading) return <LoadingState />;
  if (followingQuery.isError) {
    return <EmptyState message="Não foi possível carregar quem você segue." />;
  }

  const { users, companies } = followingQuery.data ?? { users: [], companies: [] };

  if (users.length === 0 && companies.length === 0) {
    return (
      <EmptyState
        message="Você ainda não segue ninguém. Explore sugestões na aba ao lado."
        guided={guidedEmpty}
      />
    );
  }

  return (
    <div className="space-y-6">
      {users.length > 0 ? (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Users className="h-4 w-4" aria-hidden="true" />
            Profissionais
          </h2>
          <ul className="space-y-3">
            {users.map((user) => (
              <UserListItem key={user.id} user={user} showFollowButton={false} />
            ))}
          </ul>
        </section>
      ) : null}

      {companies.length > 0 ? (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Empresas
          </h2>
          <ul className="space-y-3">
            {companies.map((company) => (
              <CompanyListItem key={company.id} company={company} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function FollowersTab() {
  const followersQuery = useFollowersList();

  if (followersQuery.isLoading) return <LoadingState />;
  if (followersQuery.isError) {
    return <EmptyState message="Não foi possível carregar seus seguidores." />;
  }

  const users = followersQuery.data?.users ?? [];

  if (users.length === 0) {
    return (
      <EmptyState message="Ninguém te segue ainda. Compartilhe seu perfil para crescer sua rede." />
    );
  }

  return (
    <ul className="space-y-3">
      {users.map((user) => (
        <UserListItem key={user.id} user={user} />
      ))}
    </ul>
  );
}

function SuggestionsTab({ guidedEmpty }: { guidedEmpty?: ReactNode }) {
  const suggestionsQuery = useFollowSuggestions();

  if (suggestionsQuery.isLoading) return <LoadingState />;
  if (suggestionsQuery.isError) {
    return <EmptyState message="Não foi possível carregar sugestões." />;
  }

  const users = suggestionsQuery.data?.users ?? [];
  const companies = suggestionsQuery.data?.companies ?? [];

  if (users.length === 0 && companies.length === 0) {
    return (
      <EmptyState
        message="Nenhuma sugestão no momento. Complete seu perfil com skills e localização."
        guided={guidedEmpty}
      />
    );
  }

  return (
    <div className="space-y-6">
      {users.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Profissionais com skills em comum
          </h2>
          <ul className="space-y-3">
            {users.map((user) => (
              <UserListItem key={user.id} user={user} />
            ))}
          </ul>
        </section>
      ) : null}

      {companies.length > 0 ? (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            Empresas verificadas
          </h2>
          <ul className="space-y-3">
            {companies.map((company) => (
              <CompanyListItem key={company.id} company={company} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export function RedePage() {
  const { shell } = useDashboardShell();
  const { context } = useCareerContext();
  const [activeTab, setActiveTab] = useState<RedeTab>("suggestions");
  const guidedEmpty = context ? (
    <GuidedEmptyStateView {...getRedeGuidedEmptyState(context)} />
  ) : undefined;

  return (
    <DashboardLayout {...shellLayoutProps(shell)}>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Rede</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie conexões, seguidores e descubra profissionais
          </p>
        </header>

        <div
          className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1"
          role="tablist"
          aria-label="Abas da rede"
        >
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div role="tabpanel">
          {activeTab === "following" ? (
            <FollowingTab guidedEmpty={guidedEmpty} />
          ) : null}
          {activeTab === "followers" ? <FollowersTab /> : null}
          {activeTab === "suggestions" ? (
            <SuggestionsTab guidedEmpty={guidedEmpty} />
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
