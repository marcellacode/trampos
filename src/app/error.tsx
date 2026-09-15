"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app] unhandled route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <p className="text-sm font-medium text-primary">Algo não saiu como esperado</p>
        <h1 className="mt-2 text-2xl font-semibold">Não foi possível carregar esta página.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Tente novamente. Se o problema persistir, volte ao início e acesse a funcionalidade novamente.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Tentar novamente</button>
          <Link href="/" className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted">Voltar ao início</Link>
        </div>
      </div>
    </main>
  );
}
