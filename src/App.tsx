import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import { Header } from './components/Header';
import { CommoditySelector } from './components/CommoditySelector';
import { ProductionChain, ProductionTreeProvider } from './components/ProductionChain';
import { useCommodities } from './hooks';
import type { CommoditySelection } from './types';

const App: FC = () => {
  const { commodities, loading, error } = useCommodities();
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
        <h1 className="mb-6 text-2xl font-bold text-white">Planetary Interaction Calculator</h1>

        {error && <p className="mb-4 text-red-400">Failed to load commodities: {error}</p>}

        <CommoditySelector
          commodities={commodities}
          loading={loading}
          selections={selections}
          onSelectCommodity={handleSelectCommodity}
          onQuantityChange={handleQuantityChange}
          onAddSelection={handleAddSelection}
          onRemoveSelection={handleRemoveSelection}
        />

        <ProductionTreeProvider>
          <ProductionChain selections={selections} />
        </ProductionTreeProvider>
      </main>
    </div>
  );
};

export { App };
