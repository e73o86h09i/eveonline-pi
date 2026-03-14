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

export type CommoditySelection = {
  id: number;
  typeId: number | null;
  quantity: number;
};

export type TradeStation = {
  id: number;
  name: string;
};

export const TRADE_STATIONS: TradeStation[] = [
  { id: 60003760, name: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant' },
  { id: 60008494, name: 'Amarr VIII (Oris) - Emperor Family Academy' },
  { id: 60011866, name: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant' },
  { id: 60004588, name: 'Rens VI - Moon 8 - Brutor Tribe Treasury' },
  { id: 60005686, name: 'Hek VIII - Moon 12 - Boundless Creation Factory' },
];

export type MarginInfo = {
  outputValue: number;
  inputCost: number;
  margin: number;
  marginPercent: number;
};

export type Project = {
  name: string;
  stationId: number;
  selections: CommoditySelection[];
  savedAt: number;
};
