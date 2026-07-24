"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginShowcase } from "@/components/auth/login-showcase";
import { LoginCard } from "@/components/auth/login-card";
import type { ActivityItem, Testimonial } from "@/types/auth";

interface LoginPageProps {
  activities: ActivityItem[];
  testimonials: Testimonial[];
}

export function LoginPage({ activities, testimonials }: LoginPageProps) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        router.push("/");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <main className="relative min-h-screen bg-[#08090A] lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-2">
        <LoginShowcase activities={activities} testimonials={testimonials} />

        <section
          className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:px-10"
          aria-label="Formulário de login"
        >
          <div
            className="pointer-events-none absolute inset-0 lg:hidden"
            aria-hidden="true"
          >
            <div className="absolute inset-0 grid-pattern opacity-30" />
            <div className="absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-[#4F7CFF]/20 blur-[100px]" />
          </div>

          <div className="relative z-10 w-full max-w-[460px]">
            <LoginCard />
          </div>
        </section>
      </div>
    </main>
  );
}
