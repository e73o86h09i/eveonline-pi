import type { FC } from 'react';
import { Badge } from 'flowbite-react';
import type { ProductionNode, Tier } from '../../../types';
import { CommodityIcon } from '../../common/CommodityIcon';
import { formatDuration, formatIsk, formatQuantity, parsePrices, sortByTier, tierColors } from '../../../utils';
import { usePICalculator } from '../../PICalculator/PICalculatorContext';

type ProductionTreeNodeProps = {
  node: ProductionNode;
  depth?: number;
  path?: string;
  onOpenCard: (event: React.MouseEvent, typeId: number, name: string, tier: Tier) => void;
};

const ProductionTreeNode: FC<ProductionTreeNodeProps> = ({ node, depth = 0, path = String(node.typeId), onOpenCard }) => {
  const { expandedNodes, toggleNode, exactNumbers, exactPrices, prices, pricesLoading, margins } = usePICalculator();
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

  const { buyMax, sellMin } = parsePrices(prices.get(node.typeId));
  const marginInfo = margins.get(node.typeId) ?? null;

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
          <CommodityIcon typeId={node.typeId} name={node.name} />
          <button
            onClick={(event) => onOpenCard(event, node.typeId, node.name, node.tier)}
            className="cursor-pointer border-b border-dashed border-gray-600 font-medium text-white hover:text-blue-400"
          >
            {node.name}
          </button>
          <span className="text-sm text-gray-400">×{formatQuantity(node.quantity, exactNumbers)}</span>
          {!pricesLoading && (
            <span className="text-xs">
              {buyMax ? <span className="text-green-400">{formatIsk(buyMax, exactPrices)}</span> : <span className="text-gray-500">n/a</span>}
              <span className="text-gray-500"> / </span>
              {sellMin ? <span className="text-yellow-400">{formatIsk(sellMin, exactPrices)}</span> : <span className="text-gray-500">n/a</span>}
              {marginInfo ? (
                <span className={marginInfo.margin >= 0 ? 'ml-1 text-green-400' : 'ml-1 text-red-400'}>
                  ({marginInfo.margin >= 0 ? '+' : ''}
                  {marginInfo.marginPercent.toFixed(1)}%)
                </span>
              ) : null}
            </span>
          )}
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
