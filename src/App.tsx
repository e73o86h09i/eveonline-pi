import { useState } from 'react';
import { Header } from './components/Header';
import { CommoditySelector } from './components/CommoditySelector';
import { ProductionChain } from './components/ProductionChain';
import { useCommodities } from './hooks';

function App() {
  const { commodities, loading, error } = useCommodities();
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Planetary Interaction Calculator</h1>

        {error && <p className="mb-4 text-red-400">Failed to load commodities: {error}</p>}

        <CommoditySelector commodities={commodities} loading={loading} selectedTypeId={selectedTypeId} onSelect={setSelectedTypeId} />

        <ProductionChain typeId={selectedTypeId} />
      </main>
    </div>
  );
}

export default App;
