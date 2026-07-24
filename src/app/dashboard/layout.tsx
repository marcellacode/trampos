import type { Metadata } from "next";
import { DashboardQueryProvider } from "@/components/dashboard/query-provider";

export const metadata: Metadata = {
  title: "Copiloto — Jobera",
  description:
    "Seu centro de comando de carreira. Veja o que a IA fez enquanto você estava fora.",
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardQueryProvider>{children}</DashboardQueryProvider>;
}
