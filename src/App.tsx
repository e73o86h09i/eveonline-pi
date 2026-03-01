import type { FC } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { CommoditySelector } from './components/CommoditySelector';
import { StationSelector } from './components/StationSelector';
import { ProductionChain, ProductionTreeProvider } from './components/ProductionChain';
import { useCommodities, useMargins, usePrices } from './hooks';
import { type CommoditySelection, TIERS, TRADE_STATIONS } from './types';

const R0_GROUP_IDS = new Set(TIERS.find((tier) => tier.tier === 'r0')?.groupIds ?? []);

const App: FC = () => {
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
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Planetary Interaction Calculator</h1>
          <StationSelector stationId={stationId} onStationChange={setStationId} />
        </div>

        {error && <p className="mb-4 text-red-400">Failed to load commodities: {error}</p>}

        <CommoditySelector
          commodities={selectableCommodities}
          loading={loading}
          prices={prices}
          pricesLoading={pricesLoading}
          margins={margins}
          selections={selections}
          onSelectCommodity={handleSelectCommodity}
          onQuantityChange={handleQuantityChange}
          onAddSelection={handleAddSelection}
          onRemoveSelection={handleRemoveSelection}
        />

        <ProductionTreeProvider prices={prices} pricesLoading={pricesLoading} margins={margins}>
          <ProductionChain selections={selections} />
        </ProductionTreeProvider>
      </main>
    </div>
  );
};

export { App };
