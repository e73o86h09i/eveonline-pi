import { createContext, useContext } from 'react';
import type { ProductionNode } from '../../types';

type ProductionTreeContextValue = {
  expandedNodes: Set<string>;
  toggleNode: (path: string, node: ProductionNode) => void;
  exactNumbers: boolean;
  setExactNumbers: (value: boolean) => void;
  activeTab: number;
  setActiveTab: (tab: number) => void;
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
