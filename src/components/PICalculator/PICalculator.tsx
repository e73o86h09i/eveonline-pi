import type { FC } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { type CommoditySelection, TIERS, TRADE_STATIONS } from '../../types';
import { useCommodities, useMargins, usePrices } from '../../hooks';
import { StationSelector } from '../StationSelector';
import { CommoditySelector } from '../CommoditySelector';
import { ProductionChain } from '../ProductionChain';
import { PICalculatorProvider } from './PICalculatorProvider';

const R0_GROUP_IDS = new Set(TIERS.find((tier) => tier.tier === 'r0')?.groupIds ?? []);

const PICalculator: FC = () => {
  const { commodities, loading, error } = useCommodities();
  const [stationId, setStationId] = useState(TRADE_STATIONS[0].id);
  const selectableCommodities = useMemo(() => commodities.filter((commodity) => !R0_GROUP_IDS.has(commodity.group_id)), [commodities]);
  const { prices, loading: pricesLoading } = usePrices(commodities, stationId);
  const margins = useMargins(selectableCommodities, prices);
  const nextIdRef = useRef(2);
  const [selections, setSelections] = useState<CommoditySelection[]>([{ id: 1, typeId: null, quantity: 1 }]);

  const handleSelectCommodity = useCallback((selectionId: number, typeId: number | null) => {
    setSelections((prev) => prev.map((sel) => (sel.id === selectionId ? { ...sel, typeId } : sel)));
  }, []);

  const handleQuantityChange = useCallback((selectionId: number, quantity: number) => {
    setSelections((prev) => prev.map((sel) => (sel.id === selectionId ? { ...sel, quantity } : sel)));
  }, []);

  const handleAddSelection = useCallback(() => {
    setSelections((prev) => [...prev, { id: nextIdRef.current++, typeId: null, quantity: 1 }]);
  }, []);

  const handleRemoveSelection = useCallback((selectionId: number) => {
    setSelections((prev) => prev.filter((sel) => sel.id !== selectionId));
  }, []);

  return (
    <PICalculatorProvider prices={prices} pricesLoading={pricesLoading} margins={margins}>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Planetary Interaction Calculator</h1>
          <StationSelector stationId={stationId} onStationChange={setStationId} />
        </div>

        {error && <p className="mb-4 text-red-400">Failed to load commodities: {error}</p>}

        <CommoditySelector
          commodities={selectableCommodities}
          loading={loading}
          selections={selections}
          onSelectCommodity={handleSelectCommodity}
          onQuantityChange={handleQuantityChange}
          onAddSelection={handleAddSelection}
          onRemoveSelection={handleRemoveSelection}
        />

        <ProductionChain selections={selections} />
      </main>
    </PICalculatorProvider>
  );
};

export default PICalculator;
