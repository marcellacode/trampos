"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GitCompare, Send, Sparkles, X } from "lucide-react";
import type { ChatMessage } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface MiniAIChatProps {
  messages: ChatMessage[];
  userName: string;
  open: boolean;
  onClose: () => void;
  onCompare?: () => void;
  className?: string;
}

const QUICK_PROMPTS = [
  "Mostrar vagas remotas",
  "Comparar top 2",
  "Filtrar por salário",
];

export function MiniAIChat({
  messages: initialMessages,
  userName,
  open,
  onClose,
  onCompare,
  className,
}: MiniAIChatProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            "Recebi sua mensagem. Quando a busca de vagas estiver conectada, responderei com recomendações baseadas no seu perfil.",
          timestamp: new Date().toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 700);
  }

  function sendQuickPrompt(prompt: string) {
    setInput(prompt);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className={cn(
            "fixed inset-y-0 right-0 z-40 flex w-full max-w-[340px] flex-col border-l border-white/[0.06] bg-[#0C0D0F] xl:static xl:z-0",
            className
          )}
          aria-label="Assistente IA de descoberta"
        >
          <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]/30">
                <Sparkles className="h-3.5 w-3.5 text-[#4F7CFF]" aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#22C55E] ring-2 ring-[#0C0D0F]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Assistente IA</p>
                <p className="text-[11px] text-[#22C55E]">Descobrindo vagas</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Fechar assistente"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {onCompare && (
            <div className="border-b border-white/[0.06] px-4 py-3">
              <button
                type="button"
                onClick={onCompare}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#4F7CFF]/25 bg-[#4F7CFF]/10 px-3 py-2 text-xs font-medium text-[#4F7CFF] transition-colors hover:bg-[#4F7CFF]/15"
              >
                <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
                Comparar vagas selecionadas
              </button>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "rounded-tl-md bg-white/[0.04] text-white/90"
                    : "ml-auto rounded-tr-md bg-[#4F7CFF]/20 text-white"
                )}
              >
                {msg.content}
                <span className="mt-1.5 block text-[10px] text-[#9CA3AF]">
                  {msg.timestamp}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] px-3 pt-2">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendQuickPrompt(prompt)}
                  className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] text-[#9CA3AF] transition-colors hover:border-white/[0.14] hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/[0.06] p-3"
          >
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 focus-within:border-[#4F7CFF]/40">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Pergunte algo, ${userName.split(" ")[0]}...`}
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF]"
                aria-label="Mensagem para o assistente"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4F7CFF] text-white transition-opacity disabled:opacity-40"
                aria-label="Enviar"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
