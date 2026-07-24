const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

export function getGroqEnv() {
  if (typeof window !== "undefined") {
    throw new Error("GROQ_API_KEY só pode ser usada no servidor.");
  }

  return {
    apiKey: process.env.GROQ_API_KEY ?? "",
    model: process.env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL,
  } as const;
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}
