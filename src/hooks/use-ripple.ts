"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  const addRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const id = nextId.current++;
    setRipples((prev) => [
      ...prev,
      {
        id,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      },
    ]);

    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  return { ripples, addRipple };
}
