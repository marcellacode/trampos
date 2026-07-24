"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "trampos-copilot-paused";
const VERIFICATION_INTERVAL_MS = 2 * 60 * 1000;

export type CopilotStatus = "active" | "paused";

interface UseCopilotStatusReturn {
  status: CopilotStatus;
  secondsUntilVerification: number;
  pause: () => void;
  resume: () => void;
}

function readPaused(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function formatVerificationCountdown(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return minutes === 1 ? "1 minuto" : `${minutes} minutos`;
  }
  return seconds === 1 ? "1 segundo" : `${seconds} segundos`;
}

export { formatVerificationCountdown, VERIFICATION_INTERVAL_MS };

export function useCopilotStatus(): UseCopilotStatusReturn {
  const [paused, setPaused] = useState(false);
  const [secondsUntilVerification, setSecondsUntilVerification] = useState(
    VERIFICATION_INTERVAL_MS / 1000
  );

  useEffect(() => {
    setPaused(readPaused());
  }, []);

  useEffect(() => {
    if (paused) return;

    const tick = setInterval(() => {
      setSecondsUntilVerification((prev) => {
        if (prev <= 1) return VERIFICATION_INTERVAL_MS / 1000;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [paused]);

  const pause = useCallback(() => {
    setPaused(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const resume = useCallback(() => {
    setPaused(false);
    localStorage.removeItem(STORAGE_KEY);
    setSecondsUntilVerification(VERIFICATION_INTERVAL_MS / 1000);
  }, []);

  return {
    status: paused ? "paused" : "active",
    secondsUntilVerification,
    pause,
    resume,
  };
}
