"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ActivityItem } from "@/types/auth";
import { AUTH_BRAND } from "@/lib/auth/constants";

const ROW_HEIGHT_PX = 28;

interface AnimatedActivityProps {
  activities: ActivityItem[];
}

export function AnimatedActivity({ activities }: AnimatedActivityProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  if (activities.length === 0) {
    return null;
  }

  const listHeightPx =
    activities.length * ROW_HEIGHT_PX + (activities.length - 1) * 10;

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) =>
        prev >= activities.length ? activities.length : prev + 1
      );
    }, 900);

    return () => clearInterval(interval);
  }, [activities.length]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/80 p-5 backdrop-blur-sm">
      <p className="mb-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Vagas monitoradas agora
      </p>

      <div style={{ height: listHeightPx }} className="relative">
        {activities.slice(0, visibleCount).map((item, index) => {
          const isComplete =
            index < visibleCount - 1 || visibleCount >= activities.length;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 py-[5px]"
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  isComplete
                    ? "bg-success/15 text-success"
                    : "bg-primary/15 text-primary"
                }`}
              >
                {isComplete ? (
                  <Check className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-3 w-3 rounded-full border-2 border-primary/30 border-t-primary"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span className="truncate text-sm text-foreground/90">{item.label}</span>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-4 text-left text-xs text-muted-foreground">
        {AUTH_BRAND.assistantName} monitora o catálogo em tempo real.
      </p>
    </div>
  );
}
