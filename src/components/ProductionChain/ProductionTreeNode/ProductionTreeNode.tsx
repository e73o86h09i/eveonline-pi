import type { FC } from 'react';
import { Badge } from 'flowbite-react';
import type { ProductionNode, Tier } from '../../../types';
import { useProductionTree } from '../ProductionTreeContext';
import { formatDuration, formatQuantity, sortByTier, tierColors } from '../utils';

type ProductionTreeNodeProps = {
  node: ProductionNode;
  depth?: number;
  path?: string;
  onOpenCard: (event: React.MouseEvent, typeId: number, name: string, tier: Tier) => void;
};

const ProductionTreeNode: FC<ProductionTreeNodeProps> = ({ node, depth = 0, path = String(node.typeId), onOpenCard }) => {
  const { expandedNodes, toggleNode, exactNumbers } = useProductionTree();
  const color = tierColors[node.tier] ?? tierColors.r0;
  const hasChildren = node.inputs.length > 0;
  const isRoot = depth === 0;
  const showToggle = hasChildren && !isRoot;
  const expanded = isRoot || expandedNodes.has(path);

  const toggleExpanded = () => {
    toggleNode(path, node);
  };

  const sortedInputs = sortByTier(node.inputs);

  const outputPerRun = node.outputPerRun ?? 1;
  const runs = node.cycleTime != null ? node.quantity / outputPerRun : 0;
  const totalTime = node.cycleTime != null ? node.cycleTime * runs : 0;

  return (
    <div className={depth > 0 ? 'ml-6 border-l border-gray-600 pl-4' : ''}>
      <div className="flex items-center gap-1 py-1">
        {showToggle ? (
          <button
            onClick={toggleExpanded}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="inline-block h-5 w-5 shrink-0" />
        )}
        <div className="flex items-center gap-2">
          <Badge color={color} className="uppercase">
            {node.tier}
          </Badge>
          <button
            onClick={(event) => onOpenCard(event, node.typeId, node.name, node.tier)}
            className="cursor-pointer border-b border-dashed border-gray-600 font-medium text-white hover:text-blue-400"
          >
            {node.name}
          </button>
          <span className="text-sm text-gray-400">×{formatQuantity(node.quantity, exactNumbers)}</span>
          {runs > 0 && (
            <span className="text-sm text-gray-500">
              ({formatQuantity(runs, exactNumbers)} {runs === 1 ? 'run' : 'runs'}, {formatDuration(totalTime)})
            </span>
          )}
        </div>
      </div>
      {hasChildren && (isRoot || expanded) && (
        <div className="mt-1">
          {sortedInputs.map((input) => (
            <ProductionTreeNode key={input.typeId} node={input} depth={depth + 1} path={`${path}.${input.typeId}`} onOpenCard={onOpenCard} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductionTreeNode;
