import type { Metadata } from "next";
import { ResetPasswordCard } from "@/components/auth/reset-password-card";

export const metadata: Metadata = {
  title: "Nova senha — Jobera",
  description: "Defina uma nova senha para sua conta Jobera.",
};

export default function Page() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        <ResetPasswordCard />
      </div>
    </main>
  );
}
