import { createContext, useContext } from 'react';
import type { MarginInfo, MarketPrice, ProductionNode } from '../../types';

type ProductionTreeContextValue = {
  trees: ProductionNode[];
  setTrees: (trees: ProductionNode[]) => void;
  expandedNodes: Set<string>;
  toggleNode: (path: string, node: ProductionNode) => void;
  exactNumbers: boolean;
  setExactNumbers: (value: boolean) => void;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  prices: Map<number, MarketPrice>;
  pricesLoading: boolean;
  margins: Map<number, MarginInfo>;
};

const ProductionTreeContext = createContext<ProductionTreeContextValue | null>(null);

export { ProductionTreeContext };

export const useProductionTree = (): ProductionTreeContextValue => {
  const ctx = useContext(ProductionTreeContext);
  if (!ctx) {
    throw new Error('useProductionTree must be used within a ProductionTreeContext provider');
  }

  return ctx;
};
