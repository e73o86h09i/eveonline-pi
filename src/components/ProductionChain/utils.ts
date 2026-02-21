const tierOrder: Record<string, number> = { p4: 0, p3: 1, p2: 2, p1: 3, r0: 4 };

export function sortByTier<T extends { tier: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (tierOrder[a.tier] ?? 99) - (tierOrder[b.tier] ?? 99));
}

export function formatQuantity(n: number, exact = false): string {
  if (exact) {
    return n.toLocaleString();
  }
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return n.toLocaleString();
}

export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  return parts.join(' ') || '0m';
}

export const tierColors: Record<string, string> = {
  r0: 'gray',
  p1: 'red',
  p2: 'yellow',
  p3: 'green',
  p4: 'blue',
};
