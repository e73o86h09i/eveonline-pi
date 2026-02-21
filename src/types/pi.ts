export type Tier = "p1" | "p2" | "p3" | "p4";

export type TierInfo = {
  tier: Tier;
  label: string;
  groupId: number;
};

export const TIERS: TierInfo[] = [
  { tier: "p1", label: "Basic Commodities (P1)", groupId: 1042 },
  { tier: "p2", label: "Refined Commodities (P2)", groupId: 1034 },
  { tier: "p3", label: "Specialized Commodities (P3)", groupId: 1040 },
  { tier: "p4", label: "Advanced Commodities (P4)", groupId: 1041 },
];

export type ProductionNode = {
  typeId: number;
  name: string;
  tier: Tier;
  quantity: number;
  schematicId?: number;
  inputs: ProductionNode[];
};
