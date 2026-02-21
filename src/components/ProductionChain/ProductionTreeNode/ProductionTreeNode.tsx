import type { FC } from 'react';
import { Badge, Tooltip } from 'flowbite-react';
import type { ProductionNode } from '../../../types';
import { useProductionTree } from '../ProductionTreeContext';
import { formatDuration, formatQuantity, sortByTier, tierColors } from '../utils';
import { NodeTooltipContent } from './NodeTooltipContent';

type ProductionTreeNodeProps = {
  node: ProductionNode;
  depth?: number;
  path?: string;
};

const ProductionTreeNode: FC<ProductionTreeNodeProps> = ({ node, depth = 0, path = String(node.typeId) }) => {
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
        <Tooltip content={<NodeTooltipContent node={node} exact={exactNumbers} />} style="dark" placement="right">
          <div className="flex cursor-help items-center gap-2">
            <Badge color={color} className="uppercase">
              {node.tier}
            </Badge>
            <span className="font-medium text-white">{node.name}</span>
            <span className="text-sm text-gray-400">×{formatQuantity(node.quantity, exactNumbers)}</span>
            {node.cycleTime != null && (
              <span className="text-sm text-gray-500">({formatDuration(node.cycleTime * (node.quantity / (node.outputPerRun ?? 1)))})</span>
            )}
          </div>
        </Tooltip>
      </div>
      {hasChildren && (isRoot || expanded) && (
        <div className="mt-1">
          {sortedInputs.map((input) => (
            <ProductionTreeNode key={input.typeId} node={input} depth={depth + 1} path={`${path}.${input.typeId}`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductionTreeNode;
