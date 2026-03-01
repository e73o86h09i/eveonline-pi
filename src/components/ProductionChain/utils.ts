import type { MarginInfo, ProductionNode, Tier } from '../../types';
import { sortByTier } from '../utils';

export type { MarginInfo };

export type SummaryEntry = {
  typeId: number;
  name: string;
  tier: Tier;
  quantity: number;
};

export type ConsumerEntry = {
  typeId: number;
  name: string;
  tier: Tier;
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

const findNodeInTrees = (roots: ProductionNode[], typeId: number): ProductionNode | null => {
  for (const root of roots) {
    const found = findNode(root, typeId);
    if (found) {
      return found;
    }
  }

  return null;
};

export const findCycleTime = (roots: ProductionNode[], typeId: number, totalQuantity: number): number => {
  const node = findNodeInTrees(roots, typeId);
  if (!node || !node.cycleTime) {
    return 0;
  }

  const outputPerRun = node.outputPerRun ?? 1;
  const runs = Math.ceil(totalQuantity / outputPerRun);

  return node.cycleTime * runs;
};

export const findConsumers = (roots: ProductionNode[], targetTypeId: number): ConsumerEntry[] => {
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
            typeId: node.typeId,
            name: node.name,
            tier: node.tier,
            quantityPerRun: perRun,
            totalRuns: runs,
            totalQuantity: input.quantity,
          });
        }
      }

      walk(input);
    }
  };

  for (const root of roots) {
    walk(root);
  }

  return sortByTier([...map.values()]);
};

export const totalQuantity = (roots: ProductionNode[], targetTypeId: number): number => {
  let sum = 0;

  const walk = (node: ProductionNode) => {
    if (node.typeId === targetTypeId) {
      sum += node.quantity;
    }

    for (const input of node.inputs) {
      walk(input);
    }
  };

  for (const root of roots) {
    walk(root);
  }

  return sum;
};

export const summarizeTrees = (roots: ProductionNode[]): SummaryEntry[] => {
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

  for (const root of roots) {
    for (const input of root.inputs) {
      walk(input);
    }
  }

  return sortByTier([...map.values()]);
};
