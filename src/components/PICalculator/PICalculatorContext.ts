import { createContext, useContext } from 'react';
import type { MarginInfo, MarketPrice, ProductionNode } from '../../types';

type PICalculatorContextValue = {
  trees: ProductionNode[];
  setTrees: (trees: ProductionNode[]) => void;
  expandedNodes: Set<string>;
  toggleNode: (path: string, node: ProductionNode) => void;
  exactNumbers: boolean;
  setExactNumbers: (value: boolean) => void;
  exactPrices: boolean;
  setExactPrices: (value: boolean) => void;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  prices: Map<number, MarketPrice>;
  pricesLoading: boolean;
  margins: Map<number, MarginInfo>;
};

const PICalculatorContext = createContext<PICalculatorContextValue | null>(null);

export { PICalculatorContext };

export const usePICalculator = (): PICalculatorContextValue => {
  const ctx = useContext(PICalculatorContext);
  if (!ctx) {
    throw new Error('usePICalculator must be used within a PICalculatorContext provider');
  }

  return ctx;
};
