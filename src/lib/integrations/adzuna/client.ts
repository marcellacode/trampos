import { getAdzunaEnv, isAdzunaConfigured } from "@/lib/integrations/adzuna/env";
import type {
  AdzunaCategoryResults,
  AdzunaJobSearchResults,
  AdzunaJobView,
  AdzunaSearchParams,
} from "@/lib/integrations/adzuna/types";

export class AdzunaApiError extends Error {
  constructor(
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "AdzunaApiError";
  }
}

function buildSearchParams(
  env: ReturnType<typeof getAdzunaEnv>,
  params: AdzunaSearchParams
): URLSearchParams {
  const search = new URLSearchParams({
    app_id: env.appId,
    app_key: env.appKey,
    sort_by: params.sortBy ?? "date",
    results_per_page: String(params.resultsPerPage ?? 20),
    max_days_old: String(params.maxDaysOld ?? 30),
  });

  if (params.what?.trim()) search.set("what", params.what.trim());
  if (params.where?.trim()) search.set("where", params.where.trim());
  if (params.category?.trim()) search.set("category", params.category.trim());

  return search;
}

async function adzunaFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300 },
  });

  if (response.status === 429) {
    throw new AdzunaApiError(
      "Limite de requisições da Adzuna atingido. Tente novamente em alguns minutos.",
      429
    );
  }

  if (!response.ok) {
    throw new AdzunaApiError(
      `Não foi possível buscar vagas na Adzuna (${response.status}).`,
      response.status
    );
  }

  return response.json() as Promise<T>;
}

export async function searchAdzunaJobs(
  params: AdzunaSearchParams = {}
): Promise<AdzunaJobSearchResults> {
  if (!isAdzunaConfigured()) {
    return { count: 0, results: [] };
  }

  const env = getAdzunaEnv();
  const page = Math.max(1, params.page ?? 1);
  const search = buildSearchParams(env, params);
  const url = `${env.baseUrl}/jobs/${env.country}/search/${page}?${search.toString()}`;

  try {
    return await adzunaFetch<AdzunaJobSearchResults>(url);
  } catch (error) {
    if (error instanceof AdzunaApiError) throw error;
    console.error("[adzuna] search failed:", error);
    throw new AdzunaApiError(
      "Erro de conexão com a Adzuna. Verifique sua internet e tente novamente."
    );
  }
}

export async function countAdzunaJobs(
  params: Pick<AdzunaSearchParams, "what" | "where" | "category"> = {}
): Promise<number> {
  if (!isAdzunaConfigured()) return 0;

  const env = getAdzunaEnv();
  const search = buildSearchParams(env, { ...params, resultsPerPage: 1 });
  const url = `${env.baseUrl}/jobs/${env.country}/count?${search.toString()}`;

  try {
    const data = await adzunaFetch<{ count: number }>(url);
    return data.count ?? 0;
  } catch (error) {
    console.error("[adzuna] count failed:", error);
    return 0;
  }
}

export async function getAdzunaCategories(): Promise<AdzunaCategoryResults> {
  if (!isAdzunaConfigured()) {
    return { results: [] };
  }

  const env = getAdzunaEnv();
  const search = new URLSearchParams({
    app_id: env.appId,
    app_key: env.appKey,
  });
  const url = `${env.baseUrl}/jobs/${env.country}/categories?${search.toString()}`;

  try {
    return await adzunaFetch<AdzunaCategoryResults>(url);
  } catch (error) {
    console.error("[adzuna] categories failed:", error);
    return { results: [] };
  }
}

export async function getAdzunaJobById(
  adzunaId: string
): Promise<AdzunaJobView | null> {
  if (!isAdzunaConfigured()) return null;

  const env = getAdzunaEnv();
  const search = new URLSearchParams({
    app_id: env.appId,
    app_key: env.appKey,
  });
  const url = `${env.baseUrl}/jobs/${env.country}/view/${adzunaId}?${search.toString()}`;

  try {
    return await adzunaFetch<AdzunaJobView>(url);
  } catch (error) {
    if (error instanceof AdzunaApiError && error.status === 404) {
      return null;
    }
    console.error("[adzuna] view failed:", error);
    return null;
  }
}
