import { getSupabaseEnv } from "@/lib/supabase/env";

export interface RestRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  accessToken?: string | null;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  prefer?: string;
}

function buildRestUrl(
  table: string,
  query?: RestRequestOptions["query"]
): string {
  const { restUrl } = getSupabaseEnv();
  const url = new URL(`${restUrl}/${table}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function restRequest<T>(
  table: string,
  options: RestRequestOptions = {}
): Promise<T> {
  const { anonKey } = getSupabaseEnv();
  const token = options.accessToken ?? anonKey;

  const response = await fetch(buildRestUrl(table, options.query), {
    method: options.method ?? "GET",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body:
      options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Supabase REST ${options.method ?? "GET"} /${table} falhou (${response.status}): ${message}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function pingSupabaseRest(): Promise<boolean> {
  try {
    await restRequest<unknown[]>("testimonials", {
      query: { select: "id", limit: 1 },
    });
    return true;
  } catch {
    return false;
  }
}
