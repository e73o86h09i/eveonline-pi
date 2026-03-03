import type { MarketPrice } from './types';

const tierOrder: Record<string, number> = { p4: 0, p3: 1, p2: 2, p1: 3, r0: 4 };

export const sortByTier = <T extends { tier: string; name: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => (tierOrder[a.tier] ?? 99) - (tierOrder[b.tier] ?? 99) || a.name.localeCompare(b.name));
};

export const formatQuantity = (value: number, exact = false): string => {
  if (exact) {
    return value.toLocaleString();
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }

  return value.toLocaleString();
};

export const formatDuration = (seconds: number): string => {
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
};

export const tierColors: Record<string, string> = {
  r0: 'gray',
  p1: 'red',
  p2: 'yellow',
  p3: 'green',
  p4: 'blue',
};

export type ParsedPrices = {
  buyMax: number | null;
  sellMin: number | null;
};

export const parsePrices = (price: MarketPrice | undefined): ParsedPrices => {
  if (!price) {
    return { buyMax: null, sellMin: null };
  }

  const buyMax = parseFloat(price.buy.max) || null;
  const sellMin = parseFloat(price.sell.min) || null;

  return { buyMax, sellMin };
};

export const formatIsk = (value: number): string => {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  if (abs >= 1_000_000_000) {
    return `${sign}${(abs / 1_000_000_000).toFixed(2)}B`;
  }

  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  }

  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(1)}K`;
  }

  return `${sign}${abs.toFixed(0)}`;
};
