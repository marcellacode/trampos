const STORAGE_KEY = "jobe-shown-jobs";

function readStore(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getShownJobIds(userId: string): Set<string> {
  const store = readStore();
  return new Set(store[userId] ?? []);
}

export function markJobsAsShown(userId: string, jobIds: string[]): void {
  if (jobIds.length === 0) return;
  const store = readStore();
  const current = new Set(store[userId] ?? []);
  for (const id of jobIds) current.add(id);
  store[userId] = [...current];
  writeStore(store);
}
