"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import type { TestimonialItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TestimonialsProps {
  testimonials: TestimonialItem[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return <TestimonialsCarousel testimonials={testimonials} />;
}

function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: TestimonialItem[];
}) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const navigate = (dir: number) => {
    setDirection(dir);
    setCurrent((prev) => {
      const next = prev + dir;
      if (next < 0) return testimonials.length - 1;
      if (next >= testimonials.length) return 0;
      return next;
    });
  };

  const testimonial = testimonials[current];

  return (
    <section
      className="relative py-24 sm:py-32"
      aria-labelledby="testimonials-heading"
      aria-roledescription="carousel"
    >
      <Container>
        <SectionHeader
          label="Depoimentos"
          title="Histórias reais de quem confiou na IA"
          description="Depoimentos publicados no catálogo da plataforma."
        />

        <div className="relative mx-auto max-w-3xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl border border-white/10 bg-[#111315] p-8 sm:p-10"
              role="group"
              aria-roledescription="slide"
              aria-label={`Depoimento ${current + 1} de ${testimonials.length}`}
            >
              <Quote className="mb-6 h-8 w-8 text-[#4F7CFF]/30" aria-hidden="true" />

              <blockquote className="text-lg leading-relaxed text-white/90 sm:text-xl">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>

              <div className="mt-8 flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4F7CFF] to-[#8B5CF6] text-sm font-bold text-white"
                  aria-hidden="true"
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-[#9CA3AF]">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2" role="tablist" aria-label="Selecionar depoimento">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Depoimento ${i + 1}`}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]",
                    i === current ? "w-6 bg-[#4F7CFF]" : "w-2 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
