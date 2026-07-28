"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { Testimonial } from "@/types/auth";

interface RotatingTestimonialsProps {
  testimonials: Testimonial[];
}

export function RotatingTestimonials({
  testimonials,
}: RotatingTestimonialsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const current = testimonials[index];

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-sm">
      <Quote className="mb-4 h-5 w-5 text-primary/40" aria-hidden="true" />

      <AnimatePresence mode="wait">
        <motion.blockquote
          key={current.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="text-sm leading-relaxed text-foreground/85"
        >
          &ldquo;{current.quote}&rdquo;
        </motion.blockquote>
      </AnimatePresence>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {current.avatar}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{current.name}</p>
          <p className="text-xs text-muted-foreground">
            {current.role} · {current.company}
          </p>
        </div>
      </div>

      {testimonials.length > 1 && (
        <div className="mt-4 flex gap-1.5">
          {testimonials.map((item, i) => (
            <div
              key={item.id}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-primary" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
