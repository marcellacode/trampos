"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { exportUserDataAction } from "@/app/actions/privacy";
import { Button } from "@/components/ui/button";

export function PrivacyDataSection() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setMessage(null);
    const result = await exportUserDataAction();
    setLoading(false);

    if (!result.success) {
      setMessage(result.error);
      return;
    }

    const blob = new Blob([result.data.json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = result.data.filename;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Download iniciado.");
  }

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
      <h2 className="text-base font-semibold text-foreground">Privacidade e dados (LGPD)</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Exporte uma cópia dos seus dados (perfil, currículo, candidaturas e posts). O perfil
        público é opt-in — você controla seções visíveis em Currículo → Visibilidade.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Para excluir sua conta, entre em contato pelo suporte ou use a opção de exclusão nas
        configurações de autenticação do Supabase vinculadas ao seu e-mail.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Button type="button" variant="outline" onClick={() => void handleExport()} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Preparando…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" aria-hidden="true" />
              Exportar meus dados (JSON)
            </>
          )}
        </Button>
        {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
      </div>
    </section>
  );
}
