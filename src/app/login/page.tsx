import type { Metadata } from "next";
import { LoginPage } from "@/components/auth/login-page";

export const metadata: Metadata = {
  title: "Entrar — Jobera",
  description:
    "Acesse sua conta Jobera e continue acompanhando sua carreira com inteligência artificial.",
};

export default function Page() {
  return <LoginPage />;
}
