"use client";

import type { TimelineActivity } from "@/types/dashboard";

interface UseLiveTimelineOptions {
  /** Events already persisted when the page loaded */
  seed: TimelineActivity[];
  /** Pause streaming (e.g. while tab hidden) */
  enabled?: boolean;
}

/**
 * Returns timeline events from the server.
 * Realtime streaming will be wired via Supabase Realtime / WebSocket.
 */
export function useLiveTimeline({ seed }: UseLiveTimelineOptions) {
  return seed;
}
