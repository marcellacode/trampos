import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jobera-ai.vercel.app"),
  title: "Jobera — Copiloto de carreira com IA",
  description:
    "Encontre vagas compatíveis com seu perfil, adapte currículo por vaga, simule entrevistas e organize candidaturas com inteligência artificial.",
  keywords: ["emprego", "carreira", "vagas", "currículo", "candidatura"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Jobera",
    description: "Encontre vagas compatíveis com seu perfil e organize suas candidaturas.",
    type: "website",
    url: "/",
    siteName: "Jobera",
    locale: "pt_BR",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
