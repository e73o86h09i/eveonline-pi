import type { ProductionNode, Tier } from '../../types';

const tierOrder: Record<string, number> = { p4: 0, p3: 1, p2: 2, p1: 3, r0: 4 };

export const sortByTier = <T extends { tier: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => (tierOrder[a.tier] ?? 99) - (tierOrder[b.tier] ?? 99));
};

export const formatQuantity = (n: number, exact = false): string => {
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

export type SummaryEntry = {
  typeId: number;
  name: string;
  tier: Tier;
  quantity: number;
};

export type ConsumerEntry = {
  parentTypeId: number;
  parentName: string;
  parentTier: Tier;
  quantityPerRun: number;
  totalRuns: number;
  totalQuantity: number;
};

export const findNode = (node: ProductionNode, typeId: number): ProductionNode | null => {
  if (node.typeId === typeId) {
    return node;
  }
  for (const input of node.inputs) {
    const found = findNode(input, typeId);
    if (found) {
      return found;
    }
  }
  return null;
};

export const findCycleTime = (root: ProductionNode, typeId: number, totalQuantity: number): number => {
  const node = findNode(root, typeId);
  if (!node || !node.cycleTime) {
    return 0;
  }
  const outputPerRun = node.outputPerRun ?? 1;
  const runs = Math.ceil(totalQuantity / outputPerRun);
  return node.cycleTime * runs;
};

export const findConsumers = (root: ProductionNode, targetTypeId: number): ConsumerEntry[] => {
  const map = new Map<number, ConsumerEntry>();

  const walk = (node: ProductionNode) => {
    for (const input of node.inputs) {
      if (input.typeId === targetTypeId) {
        const outputPerRun = node.outputPerRun ?? 1;
        const runs = node.quantity / outputPerRun;
        const perRun = input.quantity / runs;
        const existing = map.get(node.typeId);
        if (existing) {
          existing.totalRuns += runs;
          existing.totalQuantity += input.quantity;
        } else {
          map.set(node.typeId, {
            parentTypeId: node.typeId,
            parentName: node.name,
            parentTier: node.tier,
            quantityPerRun: perRun,
            totalRuns: runs,
            totalQuantity: input.quantity,
          });
        }
      }
      walk(input);
    }
  };

  walk(root);
  return sortByTier([...map.values()]);
};

export const summarizeTree = (root: ProductionNode): SummaryEntry[] => {
  const map = new Map<number, SummaryEntry>();

  const walk = (node: ProductionNode) => {
    const existing = map.get(node.typeId);
    if (existing) {
      existing.quantity += node.quantity;
    } else {
      map.set(node.typeId, { typeId: node.typeId, name: node.name, tier: node.tier, quantity: node.quantity });
    }
    for (const input of node.inputs) {
      walk(input);
    }
  };

  // Walk children only — exclude root since it's the final product, not something to produce
  for (const input of root.inputs) {
    walk(input);
  }

  return sortByTier([...map.values()]);
};
