"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { BackgroundEffects } from "@/components/auth/background-effects";
import { AnimatedActivity } from "@/components/auth/animated-activity";
import { RotatingTestimonials } from "@/components/auth/rotating-testimonials";
import { AUTH_BRAND } from "@/lib/auth/constants";

export function LoginShowcase() {
  return (
    <section
      className="relative hidden h-screen flex-col justify-between overflow-hidden bg-[#08090A] p-10 lg:flex xl:p-14"
      aria-label={`Apresentação ${AUTH_BRAND.fullName}`}
    >
      <BackgroundEffects />

      <div className="relative z-10 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7CFF]/60"
          aria-label={`${AUTH_BRAND.fullName} - Página inicial`}
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/35">
            <Sparkles className="h-4 w-4 text-[#4F7CFF]" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            {AUTH_BRAND.name}
            <span className="text-[#4F7CFF]">{AUTH_BRAND.suffix}</span>
          </span>
        </Link>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col items-center justify-center gap-8 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 space-y-5"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F7CFF]/15 ring-1 ring-[#4F7CFF]/30 glow-primary">
            <Sparkles className="h-7 w-7 text-[#4F7CFF]" aria-hidden="true" />
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-white xl:text-4xl xl:leading-tight">
            {AUTH_BRAND.tagline}
          </h2>
          <p className="mx-auto max-w-md text-base leading-relaxed text-[#9CA3AF]">
            {AUTH_BRAND.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full shrink-0"
        >
          <AnimatedActivity />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="relative z-10 shrink-0"
      >
        <RotatingTestimonials />
      </motion.div>
    </section>
  );
}
