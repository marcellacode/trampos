"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import {
  listConversationsAction,
  listMessagesAction,
  sendDirectMessageAction,
} from "@/app/actions/direct-messages";
import { Button } from "@/components/ui/button";
import type {
  ConversationSummary,
  DirectMessageRow,
} from "@/lib/supabase/queries/direct-messages";
import { cn } from "@/lib/utils";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HumanInbox({ initialConversationId }: { initialConversationId?: string }) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId ?? null);
  const [messages, setMessages] = useState<DirectMessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void listConversationsAction().then((result) => {
      setLoadingList(false);
      if (result.success) {
        setConversations(result.data);
        if (!selectedId && result.data.length > 0) {
          setSelectedId(initialConversationId ?? result.data[0].id);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    setLoadingThread(true);
    void listMessagesAction(selectedId).then((result) => {
      setLoadingThread(false);
      if (result.success) {
        setMessages(result.data);
      } else {
        setError(result.error);
      }
    });
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId || !draft.trim() || sending) return;

    setSending(true);
    setError(null);
    const result = await sendDirectMessageAction({
      conversationId: selectedId,
      content: draft.trim(),
    });
    setSending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setDraft("");
    setMessages((prev) => [...prev, result.data]);
    const refresh = await listConversationsAction();
    if (refresh.success) setConversations(refresh.data);
  }

  const active = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="grid min-h-[420px] gap-4 lg:grid-cols-[280px_1fr]">
      <div className="rounded-xl border border-border bg-card/40">
        <p className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversas
        </p>
        {loadingList ? (
          <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando…
          </div>
        ) : conversations.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            Nenhuma conversa ainda. Recrutadores podem iniciar contato a partir de candidaturas internas.
          </p>
        ) : (
          <ul className="max-h-[480px] overflow-y-auto p-2">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(conversation.id)}
                  className={cn(
                    "flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                    selectedId === conversation.id && "bg-muted/60"
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-foreground">
                      {conversation.otherUserName}
                    </span>
                    {conversation.unreadCount > 0 ? (
                      <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {conversation.jobTitle ?? conversation.companyName}
                  </span>
                  {conversation.lastMessagePreview ? (
                    <span className="mt-0.5 truncate text-xs text-muted-foreground/80">
                      {conversation.lastMessagePreview}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col rounded-xl border border-border bg-card/40">
        {!active ? (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Selecione uma conversa para ver mensagens.
          </div>
        ) : (
          <>
            <div className="border-b border-border px-4 py-3">
              <p className="font-medium text-foreground">{active.otherUserName}</p>
              <p className="text-xs text-muted-foreground">
                {active.jobTitle ? `${active.jobTitle} · ` : ""}
                {active.companyName}
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loadingThread ? (
                <div className="flex justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando mensagens…
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      message.isMine
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted/60 text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <time
                      dateTime={message.createdAt}
                      className={cn(
                        "mt-1 block text-[10px]",
                        message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {formatTime(message.createdAt)}
                    </time>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={(e) => void handleSend(e)} className="border-t border-border p-4">
              {error ? <p className="mb-2 text-xs text-destructive">{error}</p> : null}
              <div className="flex gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={2}
                  placeholder="Escreva sua mensagem…"
                  className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <Button type="submit" disabled={sending || !draft.trim()} className="self-end">
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
