const DEFAULT_COUNTRY = "br";

export function getAdzunaEnv() {
  if (typeof window !== "undefined") {
    throw new Error("Credenciais Adzuna só podem ser usadas no servidor.");
  }

  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  const country = (process.env.ADZUNA_COUNTRY ?? DEFAULT_COUNTRY).toLowerCase();

  if (!appId || !appKey) {
    throw new Error(
      "ADZUNA_APP_ID e ADZUNA_APP_KEY não configuradas. Adicione ao .env.local."
    );
  }

  return {
    appId,
    appKey,
    country,
    baseUrl: "https://api.adzuna.com/v1/api",
  } as const;
}

export function isAdzunaConfigured(): boolean {
  return Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
}
