import type { CommodityGroup, CommodityType, Schematic } from '../types';

const BASE_URL = 'https://ref-data.everef.net';

const typeCache = new Map<number, CommodityType>();
const schematicCache = new Map<number, Schematic>();
const groupCache = new Map<number, CommodityGroup>();

export const fetchType = async (typeId: number): Promise<CommodityType> => {
  const cached = typeCache.get(typeId);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${BASE_URL}/types/${typeId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch type ${typeId}`);
  }

  const data: CommodityType = await response.json();
  typeCache.set(typeId, data);
  return data;
};

export const fetchSchematic = async (schematicId: number): Promise<Schematic> => {
  const cached = schematicCache.get(schematicId);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${BASE_URL}/schematics/${schematicId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch schematic ${schematicId}`);
  }

  const data: Schematic = await response.json();
  schematicCache.set(schematicId, data);
  return data;
};

export const fetchGroup = async (groupId: number): Promise<CommodityGroup> => {
  const cached = groupCache.get(groupId);
  if (cached) {
    return cached;
  }

  const response = await fetch(`${BASE_URL}/groups/${groupId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch group ${groupId}`);
  }

  const data: CommodityGroup = await response.json();
  groupCache.set(groupId, data);
  return data;
};

export const fetchAllCommodities = async (): Promise<CommodityType[]> => {
  const groupIds = [1042, 1034, 1040, 1041]; // P1, P2, P3, P4
  const groups = await Promise.all(groupIds.map(fetchGroup));
  const allTypeIds = groups.flatMap((group) => group.type_ids);
  const types = await Promise.all(allTypeIds.map(fetchType));
  return types;
};
