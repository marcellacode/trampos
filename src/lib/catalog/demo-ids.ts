/** UUIDs from seed migration — catalog jobs/companies are not real listings. */
export const DEMO_CATALOG_JOB_IDS = new Set([
  "22222222-2222-2222-2222-222222222201",
  "22222222-2222-2222-2222-222222222202",
  "22222222-2222-2222-2222-222222222203",
  "22222222-2222-2222-2222-222222222204",
  "22222222-2222-2222-2222-222222222205",
]);

export const DEMO_CATALOG_COMPANY_IDS = new Set([
  "11111111-1111-1111-1111-111111111101",
  "11111111-1111-1111-1111-111111111102",
  "11111111-1111-1111-1111-111111111103",
  "11111111-1111-1111-1111-111111111104",
  "11111111-1111-1111-1111-111111111105",
  "11111111-1111-1111-1111-111111111106",
  "11111111-1111-1111-1111-111111111107",
  "11111111-1111-1111-1111-111111111108",
  "11111111-1111-1111-1111-111111111109",
]);

export function isDemoCatalogJobId(id: string): boolean {
  return DEMO_CATALOG_JOB_IDS.has(id);
}

export function isDemoCatalogCompanyId(id: string): boolean {
  return DEMO_CATALOG_COMPANY_IDS.has(id);
}

export function filterOutDemoCatalogJobs<T extends { id: string }>(jobs: T[]): T[] {
  return jobs.filter((job) => !isDemoCatalogJobId(job.id));
}
