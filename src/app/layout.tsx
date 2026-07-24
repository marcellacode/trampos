import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TramplyAI — Sua IA trabalha para conseguir seu próximo emprego",
  description:
    "A primeira plataforma onde uma IA trabalha para conseguir um emprego para você. Procura vagas, adapta currículo, envia candidaturas e agenda entrevistas.",
  keywords: [
    "emprego",
    "IA",
    "inteligência artificial",
    "carreira",
    "vagas",
    "currículo",
  ],
  openGraph: {
    title: "TramplyAI",
    description:
      "Sua IA trabalha para conseguir seu próximo emprego.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#08090A] text-white">
        {children}
      </body>
    </html>
  );
}
