"use client";

import { useEffect, useRef, useState } from "react";
import type { TimelineActivity } from "@/types/dashboard";
import {
  AMBIENT_TIMELINE_POOL,
  LIVE_TIMELINE_QUEUE,
  createTimelineEvent,
} from "@/lib/dashboard/timeline";

const SCRIPT_INTERVAL_MS = 4200;
const AMBIENT_INTERVAL_MS = 14000;
const MAX_VISIBLE = 12;

interface UseLiveTimelineOptions {
  /** Events already persisted when the page loaded */
  seed: TimelineActivity[];
  /** Pause streaming (e.g. while tab hidden) */
  enabled?: boolean;
}

/**
 * Keeps the timeline alive after the initial fetch.
 * Scripted pipeline first, then ambient events — swap for
 * Supabase Realtime / WebSocket without changing the UI contract.
 */
export function useLiveTimeline({
  seed,
  enabled = true,
}: UseLiveTimelineOptions) {
  const [items, setItems] = useState<TimelineActivity[]>(seed);
  const [visible, setVisible] = useState(true);
  const queueIndex = useRef(0);
  const ambientIndex = useRef(0);
  const liveCount = useRef(0);

  useEffect(() => {
    setItems(seed);
    queueIndex.current = 0;
    ambientIndex.current = 0;
    liveCount.current = 0;
  }, [seed]);

  useEffect(() => {
    const onVisibility = () =>
      setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!enabled || !visible) return;

    const pushEvent = (template: (typeof LIVE_TIMELINE_QUEUE)[number]) => {
      liveCount.current += 1;
      const now = new Date();
      const event = createTimelineEvent({
        id: `tl-live-${liveCount.current}-${now.getTime()}`,
        kind: template.kind,
        createdAt: now.toISOString(),
        title: template.title,
        description: template.description,
        href: template.href,
        isLive: true,
      });

      setItems((prev) => [...prev, event].slice(-MAX_VISIBLE));
    };

    const tick = () => {
      if (queueIndex.current < LIVE_TIMELINE_QUEUE.length) {
        pushEvent(LIVE_TIMELINE_QUEUE[queueIndex.current]);
        queueIndex.current += 1;
        return;
      }

      const template =
        AMBIENT_TIMELINE_POOL[
          ambientIndex.current % AMBIENT_TIMELINE_POOL.length
        ];
      ambientIndex.current += 1;
      pushEvent(template);
    };

    const firstDelay =
      queueIndex.current < LIVE_TIMELINE_QUEUE.length
        ? SCRIPT_INTERVAL_MS
        : AMBIENT_INTERVAL_MS;

    let timeoutId = window.setTimeout(function schedule() {
      tick();
      const next =
        queueIndex.current < LIVE_TIMELINE_QUEUE.length
          ? SCRIPT_INTERVAL_MS
          : AMBIENT_INTERVAL_MS;
      timeoutId = window.setTimeout(schedule, next);
    }, firstDelay);

    return () => window.clearTimeout(timeoutId);
  }, [enabled, visible]);

  return items;
}
