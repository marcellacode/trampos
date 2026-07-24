"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { NotificationItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

const GROUP_LABELS: Record<NotificationItem["group"], string> = {
  today: "Hoje",
  yesterday: "Ontem",
  week: "Esta semana",
};

const GROUP_ORDER: NotificationItem["group"][] = ["today", "yesterday", "week"];

export function NotificationCenter({
  open,
  onClose,
  notifications,
}: NotificationCenterProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: notifications.filter((n) => n.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111315] shadow-2xl shadow-black/50"
          role="dialog"
          aria-label="Centro de notificações"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Notificações</h2>
            <button
              type="button"
              className="text-xs text-[#4F7CFF] transition-colors hover:text-[#6B93FF]"
            >
              Marcar todas como lidas
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {grouped.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-[#9CA3AF]">
                Nenhuma notificação
              </p>
            ) : (
              grouped.map(({ group, items }) => (
                <div key={group} className="mb-2">
                  <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF]/70">
                    {GROUP_LABELS[group]}
                  </p>
                  <ul className="space-y-0.5" role="list">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.id}>
                          <div
                            className={cn(
                              "rounded-xl p-3 transition-colors hover:bg-white/[0.04]",
                              item.unread && "bg-white/[0.02]"
                            )}
                          >
                            <div className="flex gap-3">
                              <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                                style={{ backgroundColor: `${item.color}18` }}
                              >
                                <Icon
                                  className="h-4 w-4"
                                  style={{ color: item.color }}
                                  aria-hidden="true"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium text-white">
                                    {item.title}
                                  </p>
                                  {item.unread && (
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4F7CFF]" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                                  {item.description}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[11px] text-[#9CA3AF]/70">
                                    {item.time}
                                  </span>
                                  <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className="text-xs font-medium text-[#4F7CFF] transition-colors hover:text-[#6B93FF]"
                                  >
                                    {item.actionLabel}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
