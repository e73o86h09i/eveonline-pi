import type { FC, ReactNode } from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { ProductionNode } from '../../types';
import { ProductionTreeContext } from './ProductionTreeContext';

const collectDescendantPaths = (node: ProductionNode, parentPath: string): string[] => {
  const paths: string[] = [];
  for (const input of node.inputs) {
    const childPath = `${parentPath}.${input.typeId}`;
    paths.push(childPath);
    paths.push(...collectDescendantPaths(input, childPath));
  }

  return paths;
};

const ProductionTreeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [trees, setTrees] = useState<ProductionNode[]>([]);
  const [exactNumbers, setExactNumbers] = useState(false);
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
    () => ({ trees, setTrees, expandedNodes, toggleNode, exactNumbers, setExactNumbers, activeTab, setActiveTab }),
    [trees, expandedNodes, toggleNode, exactNumbers, activeTab],
  );

  return <ProductionTreeContext value={treeContextValue}>{children}</ProductionTreeContext>;
};

export default ProductionTreeProvider;
