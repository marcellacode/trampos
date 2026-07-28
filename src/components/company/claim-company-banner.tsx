"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Building2, Loader2 } from "lucide-react";
import { claimCompanyAction } from "@/app/actions/company";
import { Button } from "@/components/ui/button";

interface ClaimCompanyBannerProps {
  companyId: string;
  companyName: string;
  companySlug: string;
  isAuthenticated: boolean;
}

export function ClaimCompanyBanner({
  companyId,
  companyName,
  companySlug,
  isAuthenticated,
}: ClaimCompanyBannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
        Empresa reivindicada com sucesso.{" "}
        <Link
          href="/dashboard/empresa"
          className="font-medium underline underline-offset-2"
        >
          Gerenciar perfil da empresa
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Esta página ainda não tem dono
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Trabalha na {companyName}? Reivindique o perfil com seu e-mail
              corporativo (@{companySlug}) para editar bio, logo e benefícios.
            </p>
          </div>
        </div>

        {isAuthenticated ? (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await claimCompanyAction(companyId);
                if (result.success) {
                  setSuccess(true);
                  return;
                }
                setError(result.error);
              });
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Reivindicando…
              </>
            ) : (
              "Reivindicar empresa"
            )}
          </Button>
        ) : (
          <Button variant="outline" render={<Link href="/login" />}>
            Entrar para reivindicar
          </Button>
        )}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
