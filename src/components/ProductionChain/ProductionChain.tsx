import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Spinner, TabItem, Tabs, ToggleSwitch } from 'flowbite-react';
import type { CommoditySelection, ProductionNode, Tier } from '../../types';
import { useMultiProductionChain } from '../../hooks';
import { InfoCard } from './InfoCard';
import { usePICalculator } from '../PICalculator/PICalculatorContext';
import { ProductionTreeNode } from './ProductionTreeNode';
import { ProductionSummary } from './ProductionSummary';

type OpenCard = {
  id: string;
  typeId: number;
  name: string;
  tier: Tier;
  position: { x: number; y: number };
  flashKey: number;
};

type ProductionChainProps = {
  selections: CommoditySelection[];
};

const ProductionChain: FC<ProductionChainProps> = ({ selections }) => {
  const { trees: resolvedTrees, loading, errors } = useMultiProductionChain(selections);
  const { setTrees, exactNumbers, setExactNumbers, exactPrices, setExactPrices, activeTab, setActiveTab } = usePICalculator();
  const [openCards, setOpenCards] = useState<OpenCard[]>([]);

  const allTrees = useMemo(() => resolvedTrees.map((resolved) => resolved.tree), [resolvedTrees]);

  // Derive valid typeIds from current trees so stale cards are hidden without an effect
  const validTypeIds = useMemo(() => {
    const ids = new Set<number>();
    const collect = (node: ProductionNode) => {
      ids.add(node.typeId);
      for (const input of node.inputs) {
        collect(input);
      }
    };

    for (const tree of allTrees) {
      collect(tree);
    }

    return ids;
  }, [allTrees]);

  useEffect(() => {
    setTrees(allTrees);
  }, [allTrees, setTrees]);

  const handleOpenCard = useCallback((event: React.MouseEvent, typeId: number, name: string, tier: Tier) => {
    const cardId = `${typeId}`;
    setOpenCards((prev) => {
      const existingIndex = prev.findIndex((card) => card.id === cardId);
      if (existingIndex !== -1) {
        const existing = { ...prev[existingIndex], flashKey: prev[existingIndex].flashKey + 1 };

        return [...prev.slice(0, existingIndex), ...prev.slice(existingIndex + 1), existing];
      }

      return [
        ...prev,
        {
          id: cardId,
          typeId,
          name,
          tier,
          position: { x: event.clientX + 10, y: event.clientY - 20 },
          flashKey: 0,
        },
      ];
    });
  }, []);

  const handleCloseCard = useCallback((cardId: string) => {
    setOpenCards((prev) => prev.filter((card) => card.id !== cardId));
  }, []);

  const handlePositionChange = useCallback((cardId: string, position: { x: number; y: number }) => {
    setOpenCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, position } : card)));
  }, []);

  const handleBringToFront = useCallback((cardId: string) => {
    setOpenCards((prev) => {
      const index = prev.findIndex((card) => card.id === cardId);
      if (index === -1) {
        return prev;
      }

      const updated = { ...prev[index], flashKey: prev[index].flashKey + 1 };

      return [...prev.slice(0, index), ...prev.slice(index + 1), updated];
    });
  }, []);

  const hasSelections = selections.some((sel) => sel.typeId !== null);

  if (!hasSelections) {
    return (
      <Card className="mt-6 border-gray-700 bg-gray-800">
        <p className="text-gray-400">Select a commodity above to view its production chain.</p>
      </Card>
    );
  }

  if (errors.length > 0) {
    return (
      <Alert color="failure" className="mt-6">
        <span>Error loading production chain: {errors.join(', ')}</span>
      </Alert>
    );
  }

  if (resolvedTrees.length === 0 && loading) {
    return (
      <Card className="mt-6 border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2 text-gray-400">
          <Spinner size="md" />
          <span>Building production chain...</span>
        </div>
      </Card>
    );
  }

  if (resolvedTrees.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 border-gray-700 bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          Production Chain
          {loading && <Spinner size="sm" />}
        </h2>
        <div className="flex items-center gap-4">
          <ToggleSwitch checked={exactNumbers} onChange={setExactNumbers} label="Exact numbers" sizing="sm" />
          <ToggleSwitch checked={exactPrices} onChange={setExactPrices} label="Exact prices" sizing="sm" />
        </div>
      </div>
      <Tabs variant="underline" onActiveTabChange={setActiveTab}>
        <TabItem active={activeTab === 0} title="Tree">
          {resolvedTrees.map((resolved, idx) => (
            <div key={resolved.selectionId}>
              {idx > 0 && <hr className="my-4 border-gray-700" />}
              <ProductionTreeNode node={resolved.tree} path={`sel-${resolved.selectionId}:${resolved.tree.typeId}`} onOpenCard={handleOpenCard} />
            </div>
          ))}
        </TabItem>
        <TabItem active={activeTab === 1} title="Summary">
          <ProductionSummary onOpenCard={handleOpenCard} />
        </TabItem>
      </Tabs>

      {openCards
        .filter((card) => loading || validTypeIds.has(card.typeId))
        .map((card) => (
          <InfoCard
            key={card.id}
            typeId={card.typeId}
            name={card.name}
            tier={card.tier}
            flashKey={card.flashKey}
            initialPosition={card.position}
            onClose={() => handleCloseCard(card.id)}
            onBringToFront={() => handleBringToFront(card.id)}
            onOpenCard={handleOpenCard}
            onPositionChange={(position) => handlePositionChange(card.id, position)}
          />
        ))}
    </Card>
  );
};

export { ProductionChain };
