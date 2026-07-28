"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  EntityCrudSection,
  ModuleCrudShell,
} from "@/components/crud/module-crud-page";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { InterviewSimulator } from "@/components/dashboard/interview/interview-simulator";
import { HumanInbox } from "@/components/dashboard/messages/human-inbox";
import { MessagesInbox } from "@/components/dashboard/messages-inbox";
import { Button } from "@/components/ui/button";
import {
  useCreateTimelineEvent,
  useDeleteTimelineEvent,
  useTimelineEvents,
  useUpdateTimelineEvent,
} from "@/lib/crud/hooks";
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
            Pessoas
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
            Copiloto Jobe
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

export function AssistenteModulePage() {
  const { shell } = useDashboardShell();

  return (
    <DashboardLayout
      user={shell.user}
      notifications={shell.notifications}
      unreadNotifications={shell.unreadNotifications}
      unreadMessages={shell.unreadMessages}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Assistente de carreira
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Copiloto full-screen para planejar sua carreira, revisar currículo e preparar entrevistas.
          </p>
        </div>
        <MessagesInbox
          context="assistant"
          userName={shell.user.firstName}
          className="lg:grid-cols-[300px_1fr]"
        />
      </div>
    </DashboardLayout>
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

  const timelineQuery = useTimelineEvents("interview_invite");
  const createEvent = useCreateTimelineEvent();
  const updateEvent = useUpdateTimelineEvent();
  const deleteEvent = useDeleteTimelineEvent();
  const [interviews] = ENTREVISTAS_MODULE.entities;

  return (
    <ModuleCrudShell config={ENTREVISTAS_MODULE}>
      <InterviewSimulator
        jobId={jobId}
        roleTitle={roleTitle}
        companyName={companyName}
      />

      <div className="rounded-2xl border border-border bg-card/50 p-1">
        <p className="px-4 pt-4 text-xs font-medium uppercase tracking-wider text-[#6B7280]">
          Convites reais
        </p>
        <EntityCrudSection
          config={interviews}
          items={timelineQuery.data ?? []}
          isLoading={timelineQuery.isLoading}
          isMutating={createEvent.isPending || updateEvent.isPending}
          onCreate={async (payload) => {
            await createEvent.mutateAsync({
              title: String(payload.title ?? ""),
              description: String(payload.description ?? ""),
              href: String(payload.href ?? "/dashboard/entrevistas"),
              event_kind: "interview_invite",
            });
          }}
          onUpdate={async (id, payload) => {
            await updateEvent.mutateAsync({ id, input: payload });
          }}
          onDelete={async (id) => {
            await deleteEvent.mutateAsync(id);
          }}
        />
      </div>
    </ModuleCrudShell>
  );
}
