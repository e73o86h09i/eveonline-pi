import { useEffect, useMemo, useRef, useState } from 'react';
import type { CommodityType, MarketPrice } from '../types';
import { fetchMarketPrices } from '../api';

type PriceState = {
  prices: Map<number, MarketPrice>;
  stationId: number;
};

export const usePrices = (commodities: CommodityType[], stationId: number) => {
  const [state, setState] = useState<PriceState>({ prices: new Map(), stationId });
  const requestRef = useRef(0);

  const typeIds = useMemo(() => commodities.map((commodity) => commodity.type_id), [commodities]);

  useEffect(() => {
    if (typeIds.length === 0) {
      return;
    }

    const requestId = ++requestRef.current;

    fetchMarketPrices(typeIds, stationId)
      .then((result) => {
        if (requestRef.current === requestId) {
          setState({ prices: result, stationId });
        }
      })
      .catch(() => {
        if (requestRef.current === requestId) {
          setState({ prices: new Map(), stationId });
        }
      });
  }, [typeIds, stationId]);

  const loading = typeIds.length > 0 && state.stationId !== stationId;

  return { prices: state.prices, loading };
};
