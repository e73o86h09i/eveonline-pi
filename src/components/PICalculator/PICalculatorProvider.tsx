import { type FC, type ReactNode, useCallback, useMemo, useState } from 'react';
import { type MarginInfo, type MarketPrice, type ProductionNode } from '../../types';
import { PICalculatorContext } from './PICalculatorContext';

const collectDescendantPaths = (node: ProductionNode, parentPath: string): string[] => {
  const paths: string[] = [];
  for (const input of node.inputs) {
    const childPath = `${parentPath}.${input.typeId}`;
    paths.push(childPath);
    paths.push(...collectDescendantPaths(input, childPath));
  }

  return paths;
};

const PICalculatorProvider: FC<{ prices: Map<number, MarketPrice>; pricesLoading: boolean; margins: Map<number, MarginInfo>; children: ReactNode }> = ({
  prices,
  pricesLoading,
  margins,
  children,
}) => {
  const [trees, setTrees] = useState<ProductionNode[]>([]);
  const [exactNumbers, setExactNumbers] = useState(false);
  const [exactPrices, setExactPrices] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => new Set());
  const [activeTab, setActiveTab] = useState(0);

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

  const treeContextValue = useMemo(
    () => ({
      trees,
      setTrees,
      expandedNodes,
      toggleNode,
      exactNumbers,
      setExactNumbers,
      exactPrices,
      setExactPrices,
      activeTab,
      setActiveTab,
      prices,
      pricesLoading,
      margins,
    }),
    [trees, expandedNodes, toggleNode, exactNumbers, exactPrices, activeTab, prices, pricesLoading, margins],
  );

  return <PICalculatorContext value={treeContextValue}>{children}</PICalculatorContext>;
};

export { PICalculatorProvider };
