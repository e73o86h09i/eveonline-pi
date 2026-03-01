import type { MarketPrice } from '../types';

const BASE_URL = 'https://market.fuzzwork.co.uk';

export const fetchMarketPrices = async (typeIds: number[], stationId: number): Promise<Map<number, MarketPrice>> => {
  if (typeIds.length === 0) {
    return new Map();
  }

  const response = await fetch(`${BASE_URL}/aggregates/?station=${stationId}&types=${typeIds.join(',')}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch market prices (status ${response.status})`);
  }

  const data: Record<string, MarketPrice> = await response.json();
  const result = new Map<number, MarketPrice>();

  for (const [typeId, price] of Object.entries(data)) {
    result.set(Number(typeId), price);
  }

  return result;
};
