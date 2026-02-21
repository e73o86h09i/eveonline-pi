import { useCallback, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { CommoditySelector } from './components/CommoditySelector';
import { ProductionChain } from './components/ProductionChain';
import { ProductionTreeContext } from './components/ProductionChain/ProductionTreeContext';
import type { ProductionNode } from './types';
import { useCommodities } from './hooks';

function collectDescendantPaths(node: ProductionNode, parentPath: string): string[] {
  const paths: string[] = [];
  for (const input of node.inputs) {
    const childPath = `${parentPath}.${input.typeId}`;
    paths.push(childPath);
    paths.push(...collectDescendantPaths(input, childPath));
  }
  return paths;
}

function ProductionTreeProvider({ children }: { children: React.ReactNode }) {
  const [exactNumbers, setExactNumbers] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => new Set());

  const toggleNode = useCallback((path: string, node: ProductionNode) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
        for (const descendant of collectDescendantPaths(node, path)) {
          next.delete(descendant);
        }
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const treeContextValue = useMemo(() => ({ expandedNodes, toggleNode, exactNumbers, setExactNumbers }), [expandedNodes, toggleNode, exactNumbers]);

  return <ProductionTreeContext value={treeContextValue}>{children}</ProductionTreeContext>;
}

function App() {
  const { commodities, loading, error } = useCommodities();
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [desiredQuantity, setDesiredQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-white">Planetary Interaction Calculator</h1>

        {error && <p className="mb-4 text-red-400">Failed to load commodities: {error}</p>}

        <CommoditySelector
          commodities={commodities}
          loading={loading}
          selectedTypeId={selectedTypeId}
          onSelect={setSelectedTypeId}
          desiredQuantity={desiredQuantity}
          onQuantityChange={setDesiredQuantity}
        />

        <ProductionTreeProvider key={selectedTypeId}>
          <ProductionChain typeId={selectedTypeId} quantity={desiredQuantity} />
        </ProductionTreeProvider>
      </main>
    </div>
  );
}

export default App;
