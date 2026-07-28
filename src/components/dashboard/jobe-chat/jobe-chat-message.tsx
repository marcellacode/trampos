"use client";

import { motion } from "framer-motion";
import type {
  JobeActionButton,
  JobeConfirmation,
  JobeMessage,
  QuickReply,
} from "@/types/jobe-chat";
import { JobeJobCard } from "@/components/dashboard/jobe-chat/jobe-job-card";
import { cn } from "@/lib/utils";

interface JobeChatMessageProps {
  message: JobeMessage;
  selectedJobIds: Set<string>;
  onToggleJobSelect: (jobId: string) => void;
  onQuickReply: (reply: QuickReply) => void;
  onAction: (action: JobeActionButton) => void;
  onConfirm: (confirmation: JobeConfirmation) => void;
  onCancel: () => void;
}

export function JobeChatMessage({
  message,
  selectedJobIds,
  onToggleJobSelect,
  onQuickReply,
  onAction,
  onConfirm,
  onCancel,
}: JobeChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col gap-2", !isAssistant && "items-end")}
    >
      {message.content && (
        <div
          className={cn(
            "max-w-[95%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
            isAssistant
              ? "rounded-tl-md bg-white/[0.04] text-white/90"
              : "rounded-tr-md bg-[#4F7CFF]/20 text-white",
            message.status === "error" && "border border-[#EF4444]/30 text-[#FCA5A5]",
            message.status === "success" && "border border-[#22C55E]/30"
          )}
        >
          {message.status === "loading" ? (
            <span className="inline-flex items-center gap-2 text-[#9CA3AF]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4F7CFF]" />
              {message.content}
            </span>
          ) : (
            message.content
          )}
          <span className="mt-1.5 block text-[10px] text-[#9CA3AF]">
            {message.timestamp}
          </span>
        </div>
      )}

      {message.jobs && message.jobs.length > 0 && (
        <div className="w-full max-w-[95%] space-y-2">
          {message.jobs.map((job) => (
            <JobeJobCard
              key={job.id}
              job={job}
              selected={selectedJobIds.has(job.id)}
              onToggleSelect={onToggleJobSelect}
            />
          ))}
        </div>
      )}

      {message.quickReplies && message.quickReplies.length > 0 && (
        <div className="flex w-full max-w-[95%] flex-wrap gap-2">
          {message.quickReplies.map((reply) => (
            <button
              key={reply.id}
              type="button"
              onClick={() => onQuickReply(reply)}
              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-[#9CA3AF] transition-colors hover:border-[#4F7CFF]/30 hover:text-white"
            >
              {reply.emoji ? `${reply.emoji} ` : ""}
              {reply.label}
            </button>
          ))}
        </div>
      )}

      {message.actionButtons && message.actionButtons.length > 0 && (
        <div className="flex w-full max-w-[95%] flex-col gap-2">
          {message.actionButtons.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction(action)}
              className={cn(
                "rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                action.variant === "primary" &&
                  "bg-[#4F7CFF] text-white hover:bg-[#4F7CFF]/90",
                action.variant === "danger" &&
                  "border border-[#EF4444]/30 bg-[#EF4444]/10 text-[#FCA5A5] hover:bg-[#EF4444]/20",
                (!action.variant || action.variant === "secondary") &&
                  "border border-white/[0.08] bg-white/[0.03] text-white hover:border-[#4F7CFF]/30"
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {message.confirmation && (
        <div className="flex w-full max-w-[95%] gap-2">
          <button
            type="button"
            onClick={() => onConfirm(message.confirmation!)}
            className="flex-1 rounded-xl bg-[#4F7CFF] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#4F7CFF]/90"
          >
            {message.confirmation.confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:text-white"
          >
            {message.confirmation.cancelLabel}
          </button>
        </div>
      )}
    </motion.div>
  );
}
