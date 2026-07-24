import { getGroqEnv, isGroqConfigured } from "@/lib/ai/env";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export class GroqError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "GroqError";
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

interface GroqChatResponse {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
  error?: { message?: string };
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  if (!isGroqConfigured()) {
    throw new GroqError(
      "IA indisponível no momento. Configure GROQ_API_KEY no servidor."
    );
  }

  const { apiKey, model: defaultModel } = getGroqEnv();
  const model = options.model ?? defaultModel;

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.6,
      max_tokens: options.maxTokens ?? 1024,
      ...(options.jsonMode
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
  });

  const data = (await response.json()) as GroqChatResponse;

  if (!response.ok) {
    throw new GroqError(
      data.error?.message ?? "Erro ao comunicar com a IA.",
      response.status
    );
  }

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new GroqError("A IA não retornou uma resposta.");
  }

  return content;
}

export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const messages: ChatMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  return chatCompletion(messages);
}
