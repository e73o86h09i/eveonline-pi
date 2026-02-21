export type Tier = 'r0' | 'p1' | 'p2' | 'p3' | 'p4';

export type TierInfo = {
  tier: Tier;
  label: string;
  groupIds: number[];
};

export const TIERS: TierInfo[] = [
  { tier: 'r0', label: 'Raw Resources (R0)', groupIds: [1032, 1033, 1035] },
  { tier: 'p1', label: 'Basic Commodities (P1)', groupIds: [1042] },
  { tier: 'p2', label: 'Refined Commodities (P2)', groupIds: [1034] },
  { tier: 'p3', label: 'Specialized Commodities (P3)', groupIds: [1040] },
  { tier: 'p4', label: 'Advanced Commodities (P4)', groupIds: [1041] },
];

export type ProductionNode = {
  typeId: number;
  name: string;
  tier: Tier;
  quantity: number;
  outputPerRun?: number;
  cycleTime?: number;
  schematicId?: number;
  inputs: ProductionNode[];
};
