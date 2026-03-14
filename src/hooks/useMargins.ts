import { useEffect, useRef, useState } from 'react';
import type { CommodityType, MarginInfo, MarketPrice } from '../types';
import { fetchSchematic } from '../api';
import { parsePrices } from '../utils';
import { useGlobalLoading } from './useGlobalLoading';

const computeMargins = async (commodities: CommodityType[], prices: Map<number, MarketPrice>): Promise<Map<number, MarginInfo>> => {
  const result = new Map<number, MarginInfo>();

  for (const commodity of commodities) {
    const schematicIds = commodity.produced_by_schematic_ids;
    if (!schematicIds?.length) {
      continue;
    }

    const outputPrice = prices.get(commodity.type_id);
    if (!outputPrice) {
      continue;
    }

    const { buyMax } = parsePrices(outputPrice);
    if (!buyMax) {
      continue;
    }

    const schematic = await fetchSchematic(schematicIds[0]);
    const output = Object.values(schematic.products)[0];
    const outputPerRun = output?.quantity ?? 1;

    let inputCost = 0;
    let hasAllInputPrices = true;

    for (const material of Object.values(schematic.materials)) {
      const inputPrice = prices.get(material.type_id);
      if (!inputPrice) {
        hasAllInputPrices = false;
        break;
      }

      const { sellMin } = parsePrices(inputPrice);
      if (!sellMin) {
        hasAllInputPrices = false;
        break;
      }

      inputCost += material.quantity * sellMin;
    }

    if (!hasAllInputPrices) {
      continue;
    }

    const outputValue = outputPerRun * buyMax;
    const margin = outputValue - inputCost;
    const marginPercent = inputCost > 0 ? (margin / inputCost) * 100 : 0;
    result.set(commodity.type_id, { outputValue, inputCost, margin, marginPercent });
  }

  return result;
};

export const useMargins = (commodities: CommodityType[], prices: Map<number, MarketPrice>) => {
  const [margins, setMargins] = useState<Map<number, MarginInfo>>(() => new Map());
  const requestRef = useRef(0);
  const { startLoading, stopLoading } = useGlobalLoading();

  useEffect(() => {
    if (commodities.length === 0 || prices.size === 0) {
      return;
    }

    const requestId = ++requestRef.current;
    startLoading();

    computeMargins(commodities, prices)
      .then((result) => {
        if (requestRef.current === requestId) {
          setMargins(result);
        }
      })
      .catch(() => {
        if (requestRef.current === requestId) {
          setMargins(new Map());
        }
      })
      .finally(stopLoading);
  }, [commodities, prices, startLoading, stopLoading]);

  return margins;
};
