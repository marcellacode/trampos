"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ModuleCrudShell } from "@/components/crud/module-crud-page";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InterviewSimulator } from "@/components/dashboard/interview/interview-simulator";
import { HumanInbox } from "@/components/dashboard/messages/human-inbox";
import { MessagesInbox } from "@/components/dashboard/messages-inbox";
import { Button } from "@/components/ui/button";
import { useTimelineEvents } from "@/lib/crud/hooks";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { ENTREVISTAS_MODULE } from "@/lib/crud/modules";
import { cn } from "@/lib/utils";

type MensagensTab = "pessoas" | "jobe";

function MensagensContent() {
  const { shell } = useDashboardShell();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "jobe" ? "jobe" : "pessoas";
  const conversationId = searchParams.get("conversation") ?? undefined;
  const [activeTab, setActiveTab] = useState<MensagensTab>(initialTab);

  return (
    <DashboardLayout
      user={shell.user}
      notifications={shell.notifications}
      unreadNotifications={shell.unreadNotifications}
      unreadMessages={shell.unreadMessages}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Mensagens</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Converse com recrutadores ou com o copiloto Jobe sobre vagas e carreira.
          </p>
        </div>

        <div
          className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1"
          role="tablist"
          aria-label="Tipo de mensagens"
        >
          <Button
            type="button"
            role="tab"
            aria-selected={activeTab === "pessoas"}
            variant={activeTab === "pessoas" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("pessoas")}
          >
            Recrutadores
          </Button>
          <Button
            type="button"
            role="tab"
            aria-selected={activeTab === "jobe"}
            variant={activeTab === "jobe" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => setActiveTab("jobe")}
          >
            Assistente Jobe
          </Button>
        </div>

        <div role="tabpanel" className={cn(activeTab !== "pessoas" && "hidden")}>
          <HumanInbox initialConversationId={conversationId} />
        </div>
        <div role="tabpanel" className={cn(activeTab !== "jobe" && "hidden")}>
          <MessagesInbox context="dashboard" userName={shell.user.firstName} />
        </div>
      </div>
    </DashboardLayout>
  );
}

export function MensagensModulePage() {
  return (
    <Suspense fallback={null}>
      <MensagensContent />
    </Suspense>
  );
}

export function EntrevistasModulePage() {
  return (
    <Suspense fallback={null}>
      <EntrevistasModuleContent />
    </Suspense>
  );
}

function EntrevistasModuleContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId") ?? undefined;
  const roleTitle = searchParams.get("role") ?? undefined;
  const companyName = searchParams.get("company") ?? undefined;
  const initialTab = searchParams.get("tab") === "convites" ? "convites" : "praticar";
  const [activeTab, setActiveTab] = useState<"praticar" | "convites">(initialTab);

  const timelineQuery = useTimelineEvents("interview_invite");
  const invites = timelineQuery.data ?? [];

  return (
    <ModuleCrudShell config={ENTREVISTAS_MODULE}>
      <div
        className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/30 p-1"
        role="tablist"
        aria-label="Seções de entrevistas"
      >
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === "praticar"}
          variant={activeTab === "praticar" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setActiveTab("praticar")}
        >
          Simulador
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === "convites"}
          variant={activeTab === "convites" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1"
          onClick={() => setActiveTab("convites")}
        >
          Convites
        </Button>
      </div>

      <div role="tabpanel" className={cn(activeTab !== "praticar" && "hidden")}>
        <InterviewSimulator
          jobId={jobId}
          roleTitle={roleTitle}
          companyName={companyName}
        />
      </div>

      <div role="tabpanel" className={cn(activeTab !== "convites" && "hidden")}>
        <section
          className="rounded-2xl border border-border bg-card/50"
          aria-labelledby="interview-invites-heading"
        >
          <div className="border-b border-border px-4 py-4 sm:px-6">
            <h2
              id="interview-invites-heading"
              className="text-base font-bold text-foreground"
            >
              Convites de entrevista
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Gerados automaticamente a partir das suas candidaturas e timeline
            </p>
          </div>

          {timelineQuery.isLoading ? (
            <p className="px-4 py-6 text-sm text-muted-foreground sm:px-6">
              Carregando convites…
            </p>
          ) : invites.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground sm:px-6">
              Nenhum convite registrado ainda. Quando uma empresa avançar sua
              candidatura, o convite aparecerá aqui.
            </p>
          ) : (
            <ul className="divide-y divide-border" role="list">
              {invites.map((item) => {
                const row = item as {
                  id: string;
                  title: string;
                  description?: string | null;
                  href?: string;
                  created_at?: string;
                };
                return (
                  <li key={row.id}>
                    <Link
                      href={row.href ?? "/dashboard/entrevistas"}
                      className="block px-4 py-4 transition-colors hover:bg-muted/50 sm:px-6"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {row.title}
                      </p>
                      {row.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {row.description}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </ModuleCrudShell>
  );
}
