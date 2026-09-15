"use client";

import { useParams } from "next/navigation";
import { Construction } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useDashboardShell } from "@/lib/dashboard/hooks";
import { CurriculoModulePage } from "@/components/dashboard/modules/curriculo-page";
import { ObjetivosModulePage } from "@/components/dashboard/modules/objetivos-page";
import { EntrevistasModulePage, MensagensModulePage } from "@/components/dashboard/modules/mensagens-page";
import { AgendaModulePage } from "@/components/dashboard/modules/agenda-page";
import { ConfiguracoesModulePage } from "@/components/dashboard/modules/configuracoes-page";
import { EmpresaDashboardPage } from "@/components/dashboard/modules/empresa-page";
import { EmpresaVagasPage } from "@/components/dashboard/modules/empresa-vagas-page";
import { EmpresaCandidatosPage } from "@/components/dashboard/modules/empresa-candidatos-page";

const MODULE_PAGES: Record<string, () => React.ReactNode> = { curriculo: () => <CurriculoModulePage/>, objetivos: () => <ObjetivosModulePage/>, mensagens: () => <MensagensModulePage/>, agenda: () => <AgendaModulePage/>, entrevistas: () => <EntrevistasModulePage/>, configuracoes: () => <ConfiguracoesModulePage/> };

export function DashboardModuleRouter() {
  const params = useParams<{ slug: string[] }>(); const slug = params.slug ?? []; const section = slug[0] ?? ""; const { shell } = useDashboardShell();
  if (section === "empresa") { if (slug[1] === "vagas") return <EmpresaVagasPage/>; if (slug[1] === "candidatos") return <EmpresaCandidatosPage/>; return <EmpresaDashboardPage/>; }
  const Page = MODULE_PAGES[section]; if (Page) return Page();
  return <DashboardLayout user={shell.user} notifications={shell.notifications} unreadNotifications={shell.unreadNotifications} unreadMessages={shell.unreadMessages}><div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-20 text-center"><Construction className="mb-4 h-6 w-6 text-muted-foreground"/><h1 className="text-xl font-semibold">{section || "Seção"}</h1><p className="mt-2 text-sm text-muted-foreground">Módulo não encontrado.</p></div></DashboardLayout>;
}
