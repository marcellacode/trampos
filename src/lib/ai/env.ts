const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
const RETIRED_GROQ_MODELS = new Set([
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
]);

function readNonEmptyEnv(name: "GROQ_API_KEY" | "GROQ_MODEL"): string {
  return process.env[name]?.trim() ?? "";
}

export function getGroqEnv() {
  if (typeof window !== "undefined") {
    throw new Error("GROQ_API_KEY só pode ser usada no servidor.");
  }

  const apiKey = readNonEmptyEnv("GROQ_API_KEY");
  const configuredModel = readNonEmptyEnv("GROQ_MODEL");
  const model =
    configuredModel && !RETIRED_GROQ_MODELS.has(configuredModel)
      ? configuredModel
      : DEFAULT_GROQ_MODEL;

  return {
    apiKey,
    model,
  } as const;
}

export function isGroqConfigured(): boolean {
  return readNonEmptyEnv("GROQ_API_KEY").length > 0;
}
