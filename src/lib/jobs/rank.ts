const MEDALS = ["🥇", "🥈", "🥉"] as const;

export function getRankLabel(rank: number): string {
  return MEDALS[rank - 1] ?? String(rank);
}

export function getCompatibilityColor(value: number): string {
  if (value >= 95) return "#22C55E";
  if (value >= 85) return "#4F7CFF";
  if (value >= 70) return "#F59E0B";
  return "#9CA3AF";
}
