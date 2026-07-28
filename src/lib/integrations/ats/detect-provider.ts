export type AtsProvider = "greenhouse" | "gupy" | "workable" | "unknown";

const GREENHOUSE_RE =
  /(?:boards\.greenhouse\.io|job-boards\.greenhouse\.io|grnh\.se)/i;
const GUPY_RE = /(?:gupy\.io|portal\.gupy\.io)/i;
const WORKABLE_RE = /(?:apply\.workable\.com|workable\.com\/j\/)/i;

export function detectAtsProvider(url: string | null | undefined): AtsProvider {
  if (!url) return "unknown";
  if (GREENHOUSE_RE.test(url)) return "greenhouse";
  if (GUPY_RE.test(url)) return "gupy";
  if (WORKABLE_RE.test(url)) return "workable";
  return "unknown";
}

export function extractGreenhouseBoardToken(url: string): string | null {
  const match = url.match(/boards\.greenhouse\.io\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

export function extractGreenhouseJobId(url: string): string | null {
  const match = url.match(/jobs\/(\d+)/i);
  return match?.[1] ?? null;
}
