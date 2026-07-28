"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Send, Sparkles } from "lucide-react";
import { jobeChatAction } from "@/app/actions/ai";
import type { ChatMessage } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface CareerChatPanelProps {
  context?: "dashboard" | "assistant";
  userName: string;
  initialMessages?: ChatMessage[];
  className?: string;
}

export function CareerChatPanel({
  context = "dashboard",
  userName,
  initialMessages = [],
  className,
}: CareerChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${crypto.randomUUID()}`,
        role: "user",
        content: text,
        timestamp: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      const result = await jobeChatAction(text, context);
      setLoading(false);

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${crypto.randomUUID()}`,
          role: "assistant",
          content: result.success ? result.data.content : result.error,
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    },
    [context, input, loading]
  );

  return (
    <div className={cn("flex h-[min(70vh,640px)] flex-col rounded-2xl border border-border bg-card", className)}>
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {context === "assistant" ? "Assistente de carreira" : "Copiloto Jobe"}
          </h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Olá, {userName.split(" ")[0]}. Pergunte sobre vagas, currículo ou entrevistas.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Envie uma mensagem para começar a conversa com a IA.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
              msg.role === "user"
                ? "ml-auto bg-primary/20 text-primary-foreground"
                : "bg-muted/50 text-[#E5E7EB]"
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            <span className="mt-1 block text-[10px] text-muted-foreground">{msg.timestamp}</span>
          </div>
        ))}
        {loading && (
          <p className="text-xs text-muted-foreground">Jobe está digitando…</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-black/20 px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-lg bg-primary p-2 text-primary-foreground disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
