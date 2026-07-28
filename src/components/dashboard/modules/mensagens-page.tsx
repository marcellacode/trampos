"use client";

import { ModuleCrudShell } from "@/components/crud/module-crud-page";
import { CareerChatPanel } from "@/components/dashboard/career-chat-panel";
import { InterviewSimulator } from "@/components/dashboard/interview/interview-simulator";
import { useChatMessages } from "@/lib/crud/hooks";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { mapChatMessages } from "@/lib/supabase/mappers/dashboard";
import { MENSAGENS_MODULE, ENTREVISTAS_MODULE } from "@/lib/crud/modules";

export function MensagensModulePage() {
  const { shell } = useDashboardShell();
  const messagesQuery = useChatMessages("dashboard");

  const initialMessages = mapChatMessages(messagesQuery.data ?? []);

  return (
    <ModuleCrudShell config={MENSAGENS_MODULE}>
      <CareerChatPanel
        context="dashboard"
        userName={shell.user.firstName}
        initialMessages={initialMessages}
      />
    </ModuleCrudShell>
  );
}

export function AssistenteModulePage() {
  const { shell } = useDashboardShell();
  const messagesQuery = useChatMessages("assistant");

  const initialMessages = mapChatMessages(messagesQuery.data ?? []);

  return (
    <CareerChatPanel
      context="assistant"
      userName={shell.user.firstName}
      initialMessages={initialMessages}
      className="h-[min(80vh,720px)]"
    />
  );
}

export function EntrevistasModulePage() {
  return (
    <ModuleCrudShell config={ENTREVISTAS_MODULE}>
      <InterviewSimulator />
    </ModuleCrudShell>
  );
}
