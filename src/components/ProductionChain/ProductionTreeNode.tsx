import { Badge, Tooltip } from 'flowbite-react';
import type { ProductionNode } from '../../types';
import { useProductionTree } from './ProductionTreeContext';

type ProductionTreeNodeProps = {
  node: ProductionNode;
  depth?: number;
  path?: string;
};

const tierColors: Record<string, string> = {
  r0: 'gray',
  p1: 'red',
  p2: 'yellow',
  p3: 'green',
  p4: 'blue',
};

const tierOrder: Record<string, number> = { p4: 0, p3: 1, p2: 2, p1: 3, r0: 4 };

function sortByTier<T extends { tier: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (tierOrder[a.tier] ?? 99) - (tierOrder[b.tier] ?? 99));
}

function formatQuantity(n: number, exact = false): string {
  if (exact) {
    return n.toLocaleString();
  }
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return n.toLocaleString();
}

function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  return parts.join(' ') || '0m';
}

function NodeTooltipContent({ node, exact = false }: { node: ProductionNode; exact?: boolean }) {
  if (node.inputs.length === 0) {
    return <span>{node.name} (raw resource, extracted from planets)</span>;
  }

  const sortedInputs = sortByTier(node.inputs);
  const outputPerRun = node.outputPerRun ?? 1;
  const runs = node.quantity / outputPerRun;
  const cycleTime = node.cycleTime ?? 0;

  const perRun = sortedInputs.map((input) => ({
    name: input.name,
    qty: input.quantity / runs,
  }));

  return (
    <div className="text-left">
      <div className="mb-1 font-semibold">
        {formatQuantity(node.quantity, exact)}× {node.name}
      </div>
      <div className="mb-1 text-xs text-gray-300">Per run ({formatDuration(cycleTime)}):</div>
      <div className="text-xs">
        <div>
          {outputPerRun}× {node.name} =
        </div>
        {perRun.map((input) => (
          <div key={input.name} className="pl-3">
            {formatQuantity(input.qty, exact)}× {input.name}
          </div>
        ))}
      </div>
      {runs > 1 && (
        <div className="mt-1 border-t border-gray-600 pt-1 text-xs">
          <div>
            Total ({formatQuantity(runs, exact)} runs, {formatDuration(cycleTime * runs)}): {formatQuantity(node.quantity, exact)}× {node.name} =
          </div>
          {sortedInputs.map((input) => (
            <div key={input.name} className="pl-3">
              {formatQuantity(input.quantity, exact)}× {input.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductionTreeNode({ node, depth = 0, path = String(node.typeId) }: ProductionTreeNodeProps) {
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
}
