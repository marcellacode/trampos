import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse"],
  async redirects() {
    return [
      {
        source: "/dashboard/assistente",
        destination: "/dashboard/mensagens?tab=jobe",
        permanent: false,
      },
      {
        source: "/dashboard/mercado",
        destination: "/dashboard/vagas",
        permanent: false,
      },
      {
        source: "/dashboard/portfolio",
        destination: "/dashboard/curriculo?tab=portfolio",
        permanent: false,
      },
      {
        source: "/dashboard/estudos",
        destination: "/dashboard/empregabilidade",
        permanent: false,
      },
      {
        source: "/dashboard/empresas",
        destination: "/dashboard/vagas",
        permanent: false,
      },
      {
        source: "/dashboard/empresas/:path*",
        destination: "/dashboard/vagas",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
