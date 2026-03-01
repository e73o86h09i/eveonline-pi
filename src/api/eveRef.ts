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
  const groupIds = [1032, 1033, 1035, 1042, 1034, 1040, 1041]; // R0, P1, P2, P3, P4
  const groups = await Promise.all(groupIds.map(fetchGroup));
  const allTypeIds = groups.flatMap((group) => group.type_ids);
  const types = await Promise.all(allTypeIds.map(fetchType));

  return types;
};

const PLANET_TYPE_ATTRIBUTE_ID = '1632';
const planetCacheByResource = new Map<number, { typeId: number; name: string }[]>();

export const fetchPlanetsForResource = async (resourceTypeId: number): Promise<{ typeId: number; name: string }[]> => {
  const cached = planetCacheByResource.get(resourceTypeId);
  if (cached) {
    return cached;
  }

  const resourceType = await fetchType(resourceTypeId);
  const pinTypeIds = resourceType.harvested_by_pin_type_ids ?? [];
  if (pinTypeIds.length === 0) {
    planetCacheByResource.set(resourceTypeId, []);

    return [];
  }

  const pinTypes = await Promise.all(pinTypeIds.map(fetchType));
  const planetTypeIds = new Set<number>();
  for (const pinType of pinTypes) {
    const attr = pinType.dogma_attributes?.[PLANET_TYPE_ATTRIBUTE_ID];
    if (attr) {
      planetTypeIds.add(attr.value);
    }
  }

  const planetTypes = await Promise.all([...planetTypeIds].map(fetchType));
  const planets = planetTypes.map((planet) => ({ typeId: planet.type_id, name: planet.name.en })).sort((a, b) => a.name.localeCompare(b.name));
  planetCacheByResource.set(resourceTypeId, planets);

  return planets;
};
