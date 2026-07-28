"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import { jobeChatAction, type ChatContext } from "@/app/actions/ai";
import {
  bulkApplyJobsAction,
  bulkDismissJobsAction,
  fetchApplicationsSummaryAction,
  fetchNewJobsForChatAction,
  searchJobsForChatAction,
} from "@/app/actions/jobe-chat";
import { JobeChatMessage } from "@/components/dashboard/jobe-chat/jobe-chat-message";
import { AUTH_BRAND } from "@/lib/auth/constants";
import {
  getShownJobIds,
  markJobsAsShown,
} from "@/lib/jobe/shown-jobs-storage";
import {
  JOB_LIST_ACTIONS,
  MAIN_MENU_REPLIES,
  type ChatJob,
  type JobeActionButton,
  type JobeConfirmation,
  type JobeMessage,
  type QuickReply,
} from "@/types/jobe-chat";
import { cn } from "@/lib/utils";

interface JobeChatProps {
  userId: string;
  userName: string;
  open: boolean;
  onClose: () => void;
  context?: ChatContext;
  className?: string;
}

function nowTimestamp(): string {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createMessage(
  partial: Omit<JobeMessage, "id" | "timestamp"> & { id?: string }
): JobeMessage {
  return {
    id: partial.id ?? crypto.randomUUID(),
    timestamp: nowTimestamp(),
    ...partial,
  };
}

function createWelcomeMessage(userName: string): JobeMessage {
  const firstName = userName.split(" ")[0];
  return createMessage({
    role: "assistant",
    content: `Oi, ${firstName} 👋\nQue bom te ver por aqui! Como posso te ajudar hoje?`,
    quickReplies: MAIN_MENU_REPLIES,
  });
}

export function JobeChat({
  userId,
  userName,
  open,
  onClose,
  context = "dashboard",
  className,
}: JobeChatProps) {
  const [messages, setMessages] = useState<JobeMessage[]>([]);
  const [activeJobs, setActiveJobs] = useState<ChatJob[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [awaitingSearch, setAwaitingSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const appendMessage = useCallback((message: JobeMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const appendUserMessage = useCallback(
    (content: string) => {
      appendMessage(createMessage({ role: "user", content }));
    },
    [appendMessage]
  );

  const showMainMenu = useCallback(() => {
    appendMessage(
      createMessage({
        role: "assistant",
        content: "O que mais posso fazer por você?",
        quickReplies: MAIN_MENU_REPLIES,
      })
    );
  }, [appendMessage]);

  const showJobResults = useCallback(
    (jobs: ChatJob[], intro: string) => {
      setActiveJobs(jobs);
      setSelectedJobIds(new Set());
      markJobsAsShown(
        userId,
        jobs.map((job) => job.id)
      );

      appendMessage(
        createMessage({
          role: "assistant",
          content: intro,
          jobs,
          actionButtons: jobs.length > 0 ? JOB_LIST_ACTIONS : undefined,
          quickReplies: jobs.length === 0 ? MAIN_MENU_REPLIES : undefined,
        })
      );
    },
    [appendMessage, userId]
  );

  const handleNewJobs = useCallback(async () => {
    appendUserMessage("Ver novas vagas");
    const loadingId = crypto.randomUUID();
    appendMessage(
      createMessage({
        id: loadingId,
        role: "assistant",
        content: "Buscando vagas com base no seu perfil...",
        status: "loading",
      })
    );
    setLoading(true);

    const shownIds = [...getShownJobIds(userId)];
    const result = await fetchNewJobsForChatAction(shownIds);

    setLoading(false);
    setMessages((prev) => prev.filter((msg) => msg.id !== loadingId));

    if (!result.success) {
      appendMessage(
        createMessage({
          role: "assistant",
          content: result.error,
          status: "error",
          quickReplies: MAIN_MENU_REPLIES,
        })
      );
      return;
    }

    const count = result.data.length;
    if (count === 0) {
      showJobResults(
        [],
        "Não encontrei novas vagas no momento. Posso refinar as recomendações ou você pode atualizar seu perfil."
      );
      return;
    }

    showJobResults(
      result.data,
      `Encontrei ${count} novas vagas com base no seu perfil 👇\nVocê pode visualizar, selecionar ou se candidatar em todas.`
    );
  }, [appendMessage, appendUserMessage, showJobResults, userId]);

  const handleTrackApplications = useCallback(async () => {
    appendUserMessage("Acompanhar candidaturas");
    setLoading(true);

    const result = await fetchApplicationsSummaryAction();
    setLoading(false);

    if (!result.success) {
      appendMessage(
        createMessage({
          role: "assistant",
          content: result.error,
          status: "error",
          quickReplies: MAIN_MENU_REPLIES,
        })
      );
      return;
    }

    if (result.data.length === 0) {
      appendMessage(
        createMessage({
          role: "assistant",
          content:
            "Você ainda não se candidatou a nenhuma vaga. Quer que eu mostre novas oportunidades?",
          quickReplies: [
            { id: "new-jobs", label: "Ver novas vagas", emoji: "🔍" },
            ...MAIN_MENU_REPLIES.filter((reply) => reply.id !== "new-jobs"),
          ],
        })
      );
      return;
    }

    const lines = result.data
      .slice(0, 5)
      .map(
        (app) =>
          `• ${app.roleTitle} — ${app.companyName}\n  Status: ${app.statusLabel}`
      )
      .join("\n\n");

    appendMessage(
      createMessage({
        role: "assistant",
        content: `Suas candidaturas recentes:\n\n${lines}`,
        quickReplies: MAIN_MENU_REPLIES,
      })
    );
  }, [appendMessage, appendUserMessage]);

  const handleUpdateResume = useCallback(() => {
    appendUserMessage("Atualizar currículo");
    appendMessage(
      createMessage({
        role: "assistant",
        content:
          "Para melhorar suas recomendações, mantenha seu currículo atualizado.\n\nVocê pode:\n• Adicionar experiências recentes\n• Incluir novas skills\n• Ajustar seu cargo desejado\n\nEnquanto isso, posso continuar te ajudando por aqui.",
        quickReplies: [
          { id: "new-jobs", label: "Ver novas vagas", emoji: "🔍" },
          { id: "help", label: "Tirar dúvidas", emoji: "❓" },
          ...MAIN_MENU_REPLIES.filter(
            (reply) => reply.id !== "new-jobs" && reply.id !== "help"
          ),
        ],
      })
    );
  }, [appendMessage, appendUserMessage]);

  const handleSearchJobs = useCallback(() => {
    appendUserMessage("Procurar vagas");
    setAwaitingSearch(true);
    appendMessage(
      createMessage({
        role: "assistant",
        content:
          "Me conta o que você procura — cargo, tecnologia, empresa ou localização.",
      })
    );
  }, [appendMessage, appendUserMessage]);

  const handleHelp = useCallback(() => {
    appendUserMessage("Tirar dúvidas");
    appendMessage(
      createMessage({
        role: "assistant",
        content:
          "Claro! Pode me perguntar sobre vagas, candidaturas, currículo ou mercado de trabalho.",
      })
    );
  }, [appendMessage, appendUserMessage]);

  const handleQuickReply = useCallback(
    (reply: QuickReply) => {
      switch (reply.id) {
        case "new-jobs":
          void handleNewJobs();
          break;
        case "update-resume":
          handleUpdateResume();
          break;
        case "track-applications":
          void handleTrackApplications();
          break;
        case "search-jobs":
          handleSearchJobs();
          break;
        case "help":
          handleHelp();
          break;
        default:
          appendUserMessage(reply.label);
          showMainMenu();
      }
    },
    [
      appendUserMessage,
      handleHelp,
      handleNewJobs,
      handleSearchJobs,
      handleTrackApplications,
      handleUpdateResume,
      showMainMenu,
    ]
  );

  const requestConfirmation = useCallback(
    (actionId: string, content: string) => {
      setPendingAction(actionId);
      appendMessage(
        createMessage({
          role: "assistant",
          content,
          confirmation: {
            actionId,
            confirmLabel: "Confirmar",
            cancelLabel: "Cancelar",
          },
        })
      );
    },
    [appendMessage]
  );

  const handleAction = useCallback(
    (action: JobeActionButton) => {
      if (activeJobs.length === 0) return;

      switch (action.id) {
        case "apply-all":
          requestConfirmation(
            "apply-all",
            `Deseja se candidatar a todas as ${activeJobs.length} vagas?`
          );
          break;
        case "apply-selected": {
          if (selectedJobIds.size === 0) {
            appendMessage(
              createMessage({
                role: "assistant",
                content: "Selecione pelo menos uma vaga antes de continuar.",
                status: "error",
              })
            );
            return;
          }
          requestConfirmation(
            "apply-selected",
            `Deseja se candidatar às ${selectedJobIds.size} vagas selecionadas?`
          );
          break;
        }
        case "dismiss-all":
          requestConfirmation(
            "dismiss-all",
            `Deseja dispensar todas as ${activeJobs.length} vagas? Elas não aparecerão novamente.`
          );
          break;
      }
    },
    [activeJobs.length, appendMessage, requestConfirmation, selectedJobIds.size]
  );

  const executePendingAction = useCallback(async () => {
    if (!pendingAction || activeJobs.length === 0) return;

    const action = pendingAction;
    setPendingAction(null);
    setLoading(true);

    if (action === "apply-all") {
      const payload = activeJobs.map((job) => ({
        jobId: job.id,
        companyId: job.companyId,
        roleTitle: job.role,
      }));
      const result = await bulkApplyJobsAction(payload);
      setLoading(false);

      if (!result.success) {
        appendMessage(
          createMessage({
            role: "assistant",
            content: result.error,
            status: "error",
            quickReplies: MAIN_MENU_REPLIES,
          })
        );
        return;
      }

      appendMessage(
        createMessage({
          role: "assistant",
          content: `Você se candidatou a ${result.data.count} vagas 🎉`,
          status: "success",
          quickReplies: MAIN_MENU_REPLIES,
        })
      );
      setActiveJobs([]);
      setSelectedJobIds(new Set());
      return;
    }

    if (action === "apply-selected") {
      const selected = activeJobs.filter((job) => selectedJobIds.has(job.id));
      const result = await bulkApplyJobsAction(
        selected.map((job) => ({
          jobId: job.id,
          companyId: job.companyId,
          roleTitle: job.role,
        }))
      );
      setLoading(false);

      if (!result.success) {
        appendMessage(
          createMessage({
            role: "assistant",
            content: result.error,
            status: "error",
            quickReplies: MAIN_MENU_REPLIES,
          })
        );
        return;
      }

      appendMessage(
        createMessage({
          role: "assistant",
          content: `Você se candidatou a ${result.data.count} vagas 🎉`,
          status: "success",
          quickReplies: MAIN_MENU_REPLIES,
        })
      );
      setActiveJobs([]);
      setSelectedJobIds(new Set());
      return;
    }

    if (action === "dismiss-all") {
      const result = await bulkDismissJobsAction(activeJobs.map((job) => job.id));
      setLoading(false);

      if (!result.success) {
        appendMessage(
          createMessage({
            role: "assistant",
            content: result.error,
            status: "error",
            quickReplies: MAIN_MENU_REPLIES,
          })
        );
        return;
      }

      appendMessage(
        createMessage({
          role: "assistant",
          content: "Tudo bem! Vou ignorar essas vagas por enquanto 👍",
          quickReplies: MAIN_MENU_REPLIES,
        })
      );
      setActiveJobs([]);
      setSelectedJobIds(new Set());
    }
  }, [
    activeJobs,
    appendMessage,
    pendingAction,
    selectedJobIds,
  ]);

  const handleConfirm = useCallback(
    (_confirmation: JobeConfirmation) => {
      void executePendingAction();
    },
    [executePendingAction]
  );

  const handleCancel = useCallback(() => {
    setPendingAction(null);
    appendMessage(
      createMessage({
        role: "assistant",
        content: "Ação cancelada. Posso ajudar com mais alguma coisa?",
        quickReplies: MAIN_MENU_REPLIES,
      })
    );
  }, [appendMessage]);

  const handleToggleJobSelect = useCallback((jobId: string) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  }, []);

  const handleFreeText = useCallback(
    async (text: string) => {
      appendUserMessage(text);
      setInput("");
      setLoading(true);

      if (awaitingSearch) {
        setAwaitingSearch(false);
        const loadingId = crypto.randomUUID();
        appendMessage(
          createMessage({
            id: loadingId,
            role: "assistant",
            content: "Procurando vagas...",
            status: "loading",
          })
        );

        const result = await searchJobsForChatAction(text);
        setLoading(false);
        setMessages((prev) => prev.filter((msg) => msg.id !== loadingId));

        if (!result.success) {
          appendMessage(
            createMessage({
              role: "assistant",
              content: result.error,
              status: "error",
              quickReplies: MAIN_MENU_REPLIES,
            })
          );
          return;
        }

        if (result.data.length === 0) {
          appendMessage(
            createMessage({
              role: "assistant",
              content: `Não encontrei vagas para "${text}". Quer tentar outra busca?`,
              quickReplies: [
                { id: "search-jobs", label: "Procurar vagas", emoji: "💼" },
                ...MAIN_MENU_REPLIES,
              ],
            })
          );
          return;
        }

        showJobResults(
          result.data,
          `Encontrei ${result.data.length} vagas para "${text}" 👇`
        );
        return;
      }

      const result = await jobeChatAction(text, context);
      setLoading(false);

      appendMessage(
        createMessage({
          role: "assistant",
          content: result.success ? result.data.content : result.error,
          status: result.success ? undefined : "error",
          quickReplies: MAIN_MENU_REPLIES,
        })
      );
    },
    [appendMessage, appendUserMessage, awaitingSearch, context, showJobResults]
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    void handleFreeText(text);
  }

  useEffect(() => {
    if (open && !initialized) {
      setMessages([createWelcomeMessage(userName)]);
      setInitialized(true);
    }
  }, [initialized, open, userName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

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
          aria-label={AUTH_BRAND.assistantName}
        >
          <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]/30">
                <Sparkles className="h-3.5 w-3.5 text-[#4F7CFF]" aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#22C55E] ring-2 ring-[#0C0D0F]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{AUTH_BRAND.assistantName}</p>
                <p className="text-[11px] text-[#22C55E]">
                  {loading ? "Digitando..." : "Online · trabalhando"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-white"
              aria-label={`Fechar ${AUTH_BRAND.assistantName}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto p-4"
          >
            {messages.map((message) => (
              <JobeChatMessage
                key={message.id}
                message={message}
                selectedJobIds={selectedJobIds}
                onToggleJobSelect={handleToggleJobSelect}
                onQuickReply={handleQuickReply}
                onAction={handleAction}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            ))}
            {loading && messages[messages.length - 1]?.status !== "loading" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-[90%] rounded-2xl rounded-tl-md bg-white/[0.04] px-3.5 py-2.5 text-sm text-[#9CA3AF]"
              >
                Jobe está pensando...
              </motion.div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/[0.06] p-3"
          >
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 focus-within:border-[#4F7CFF]/40">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  awaitingSearch
                    ? "Ex: React remoto, pleno..."
                    : `Pergunte algo, ${userName.split(" ")[0]}...`
                }
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF]"
                aria-label={`Mensagem para ${AUTH_BRAND.assistantName}`}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
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
