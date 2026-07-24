import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-page";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  fetchAuthTestimonials,
  fetchRecentJobActivity,
} from "@/lib/supabase/queries/content";

export const metadata: Metadata = {
  title: "Entrar — Jobera",
  description:
    "Acesse sua conta Jobera e continue acompanhando sua carreira com inteligência artificial.",
};

export default async function Page() {
  let activities: Awaited<ReturnType<typeof fetchRecentJobActivity>> = [];
  let testimonials: Awaited<ReturnType<typeof fetchAuthTestimonials>> = [];

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createServerSupabaseClient();
      [activities, testimonials] = await Promise.all([
        fetchRecentJobActivity(supabase),
        fetchAuthTestimonials(supabase),
      ]);
    } catch {
      // Login still works without showcase data.
    }
  }

  return (
    <LoginPage activities={activities} testimonials={testimonials} />
  );
}
