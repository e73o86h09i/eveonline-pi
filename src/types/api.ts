export type LocalizedString = {
  de: string;
  en: string;
  es: string;
  fr: string;
  ja: string;
  ko: string;
  ru: string;
  zh: string;
};

export type SchematicMaterial = {
  quantity: number;
  type_id: number;
};

export type Schematic = {
  schematic_id: number;
  name: LocalizedString;
  cycle_time: number;
  materials: Record<string, SchematicMaterial>;
  products: Record<string, SchematicMaterial>;
};

export type DogmaAttribute = {
  attribute_id: number;
  value: number;
};

export type CommodityType = {
  type_id: number;
  name: LocalizedString;
  group_id: number;
  category_id: number;
  published: boolean;
  description: LocalizedString;
  produced_by_schematic_ids?: number[];
  harvested_by_pin_type_ids?: number[];
  dogma_attributes?: Record<string, DogmaAttribute>;
};

export type CommodityGroup = {
  group_id: number;
  category_id: number;
  name: LocalizedString;
  published: boolean;
  type_ids: number[];
};

export type MarketOrderStats = {
  weightedAverage: string;
  max: string;
  min: string;
  stddev: string;
  median: string;
  volume: string;
  orderCount: string;
  percentile: string;
};

export type MarketPrice = {
  buy: MarketOrderStats;
  sell: MarketOrderStats;
};
