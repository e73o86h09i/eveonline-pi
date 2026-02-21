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

export type CommodityType = {
  type_id: number;
  name: LocalizedString;
  group_id: number;
  category_id: number;
  published: boolean;
  description: LocalizedString;
  produced_by_schematic_ids?: number[];
};

export type CommodityGroup = {
  group_id: number;
  category_id: number;
  name: LocalizedString;
  published: boolean;
  type_ids: number[];
};
