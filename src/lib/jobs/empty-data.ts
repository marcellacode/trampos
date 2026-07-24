import type { DiscoveryData } from "@/types/jobs";

export const EMPTY_DISCOVERY: DiscoveryData = {
  summary: {
    analyzed: 0,
    compatible: 0,
    veryCompatible: 0,
    perfect: 0,
  },
  filters: [],
  jobs: [],
  companies: [],
  regions: [],
  salaryRadar: [],
  marketInsights: [],
  chat: [],
};

export function isDiscoveryEmpty(data: DiscoveryData): boolean {
  return data.jobs.length === 0;
}
