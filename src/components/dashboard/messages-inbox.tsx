"use client";

import { useEffect, useMemo } from "react";
import { CareerChatPanel } from "@/components/dashboard/career-chat-panel";
import { useChatMessages, useMarkChatRead } from "@/lib/crud/hooks";
import { mapChatMessages } from "@/lib/supabase/mappers/dashboard";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/dashboard";

interface MessagesInboxProps {
  context?: "dashboard" | "assistant";
  userName: string;
  className?: string;
}

function groupMessagesByDay(messages: ChatMessage[]): { label: string; messages: ChatMessage[] }[] {
  const groups = new Map<string, ChatMessage[]>();

  for (const msg of messages) {
    const label = msg.timestamp.includes("/")
      ? msg.timestamp.split(",")[0]?.trim() || "Hoje"
      : "Conversa";
    const existing = groups.get(label) ?? [];
    existing.push(msg);
    groups.set(label, existing);
  }

  if (groups.size === 0) {
    return [{ label: "Conversa", messages: [] }];
  }

  return Array.from(groups.entries()).map(([label, msgs]) => ({
    label,
    messages: msgs,
  }));
}

export function MessagesInbox({
  context = "dashboard",
  userName,
  className,
}: MessagesInboxProps) {
  const messagesQuery = useChatMessages(context);
  const markRead = useMarkChatRead(context);

  const initialMessages = useMemo(
    () => mapChatMessages(messagesQuery.data ?? []),
    [messagesQuery.data]
  );

  const groups = useMemo(() => groupMessagesByDay(initialMessages), [initialMessages]);
  const previewMessages = initialMessages.slice(-6);

  useEffect(() => {
    if (initialMessages.length > 0 && !markRead.isPending) {
      markRead.mutate();
    }
  }, [initialMessages.length, markRead]);

  return (
    <div
      className={cn(
        "grid gap-4 lg:grid-cols-[280px_1fr] lg:gap-6",
        className
      )}
    >
      <aside className="rounded-2xl border border-white/[0.08] bg-[#111315] p-4">
        <h3 className="text-sm font-semibold text-white">Caixa de entrada</h3>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          {context === "assistant"
            ? "Histórico com o assistente de carreira"
            : "Histórico com o copiloto Jobe"}
        </p>

        <ul className="mt-4 space-y-2" role="list">
          {groups.map((group) => (
            <li key={group.label}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                {group.label}
              </p>
              {group.messages.slice(-3).map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                >
                  <p className="text-[10px] font-medium text-[#4F7CFF]">
                    {msg.role === "user" ? "Você" : "Jobe"}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-[#9CA3AF]">
                    {msg.content}
                  </p>
                </div>
              ))}
            </li>
          ))}

          {previewMessages.length === 0 && (
            <li className="rounded-lg border border-dashed border-white/[0.08] px-3 py-6 text-center text-xs text-[#9CA3AF]">
              Nenhuma mensagem ainda. Inicie a conversa ao lado.
            </li>
          )}
        </ul>
      </aside>

      <CareerChatPanel
        context={context}
        userName={userName}
        initialMessages={initialMessages}
        className="h-[min(75vh,680px)]"
      />
    </div>
  );
}
