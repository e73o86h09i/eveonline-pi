import type { FC } from 'react';
import type { ProductionNode } from '../../../types';
import { formatDuration, formatQuantity, sortByTier } from '../utils';

type NodeTooltipContentProps = {
  node: ProductionNode;
  exact?: boolean;
};

const NodeTooltipContent: FC<NodeTooltipContentProps> = ({ node, exact = false }) => {
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
};

export { NodeTooltipContent };
