const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

function readNonEmptyEnv(name: "GROQ_API_KEY" | "GROQ_MODEL"): string {
  return process.env[name]?.trim() ?? "";
}

export function getGroqEnv() {
  if (typeof window !== "undefined") {
    throw new Error("GROQ_API_KEY só pode ser usada no servidor.");
  }

  const apiKey = readNonEmptyEnv("GROQ_API_KEY");
  const configuredModel = readNonEmptyEnv("GROQ_MODEL");

  return {
    apiKey,
    model: configuredModel || DEFAULT_GROQ_MODEL,
  } as const;
}

export function isGroqConfigured(): boolean {
  return readNonEmptyEnv("GROQ_API_KEY").length > 0;
}
