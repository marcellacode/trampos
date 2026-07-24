"use client";

import { useParams } from "next/navigation";
import { Construction } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MOCK_DASHBOARD } from "@/lib/dashboard/constants";

const TITLES: Record<string, string> = {
  vagas: "Vagas",
  assistente: "Assistente IA",
  curriculo: "Currículo",
  portfolio: "Portfólio",
  objetivos: "Objetivos",
  empregabilidade: "Empregabilidade",
  mercado: "Mercado",
  entrevistas: "Entrevistas",
  agenda: "Agenda",
  mensagens: "Mensagens",
  empresas: "Empresas Favoritas",
  configuracoes: "Configurações",
};

export default function DashboardSectionPage() {
  const params = useParams<{ slug: string[] }>();
  const section = params.slug?.[0] ?? "seção";
  const title = TITLES[section] ?? section;

  return (
    <DashboardLayout
      user={MOCK_DASHBOARD.user}
      notifications={MOCK_DASHBOARD.notifications}
      unreadNotifications={MOCK_DASHBOARD.unreadNotifications}
      unreadMessages={MOCK_DASHBOARD.unreadMessages}
      chatMessages={MOCK_DASHBOARD.chat}
    >
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] px-6 py-24 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4F7CFF]/10 ring-1 ring-[#4F7CFF]/25">
          <Construction className="h-5 w-5 text-[#4F7CFF]" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-[#9CA3AF]">
          Esta seção está sendo construída. O Copiloto já está ativo no dashboard
          principal.
        </p>
      </div>
    </DashboardLayout>
  );
}
