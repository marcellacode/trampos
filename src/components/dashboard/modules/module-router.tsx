"use client";

import { useParams } from "next/navigation";
import { Construction } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { CurriculoModulePage } from "@/components/dashboard/modules/curriculo-page";
import { PortfolioModulePage } from "@/components/dashboard/modules/portfolio-page";
import { ObjetivosModulePage } from "@/components/dashboard/modules/objetivos-page";
import {
  AssistenteModulePage,
  EntrevistasModulePage,
  MensagensModulePage,
} from "@/components/dashboard/modules/mensagens-page";
import { EmpresasModulePage } from "@/components/dashboard/modules/empresas-page";
import { AgendaModulePage } from "@/components/dashboard/modules/agenda-page";
import {
  ConfiguracoesModulePage,
  MercadoModulePage,
} from "@/components/dashboard/modules/configuracoes-page";

const MODULE_PAGES: Record<string, () => React.ReactNode> = {
  curriculo: () => <CurriculoModulePage />,
  portfolio: () => <PortfolioModulePage />,
  objetivos: () => <ObjetivosModulePage />,
  mensagens: () => <MensagensModulePage />,
  assistente: () => <AssistenteModulePage />,
  empresas: () => <EmpresasModulePage />,
  agenda: () => <AgendaModulePage />,
  entrevistas: () => <EntrevistasModulePage />,
  configuracoes: () => <ConfiguracoesModulePage />,
  mercado: () => <MercadoModulePage />,
};

export function DashboardModuleRouter() {
  const params = useParams<{ slug: string[] }>();
  const section = params.slug?.[0] ?? "";
  const Page = MODULE_PAGES[section];
  const { shell } = useDashboardShell();

  if (Page) {
    return Page();
  }

  return (
    <DashboardLayout
      user={shell.user}
      notifications={shell.notifications}
      unreadNotifications={shell.unreadNotifications}
      unreadMessages={shell.unreadMessages}
    >
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-24 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/25">
          <Construction className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">{section || "Seção"}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Módulo não encontrado.
        </p>
      </div>
    </DashboardLayout>
  );
}
