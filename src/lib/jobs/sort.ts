export function sortByCompatibility<T extends { compatibility: number }>(
  items: T[],
  tiebreaker?: (item: T) => string
): T[] {
  return [...items].sort((a, b) => {
    if (b.compatibility !== a.compatibility) {
      return b.compatibility - a.compatibility;
    }
    if (tiebreaker) {
      return tiebreaker(a).localeCompare(tiebreaker(b), "pt-BR");
    }
    return 0;
  });
}
