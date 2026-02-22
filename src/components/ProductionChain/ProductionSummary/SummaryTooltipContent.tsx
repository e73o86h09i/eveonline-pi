import type { FC } from 'react';
import { useMemo } from 'react';
import type { ProductionNode } from '../../../types';
import { findConsumers, formatQuantity } from '../utils';

type SummaryTooltipContentProps = {
  trees: ProductionNode[];
  typeId: number;
  name: string;
  quantity: number;
  exact?: boolean;
};

const SummaryTooltipContent: FC<SummaryTooltipContentProps> = ({ trees, typeId, name, quantity, exact = false }) => {
  const consumers = useMemo(() => findConsumers(trees, typeId), [trees, typeId]);

  if (consumers.length === 0) {
    return <span>{name} — raw resource, extracted from planets</span>;
  }

  const showTotal = consumers.some((consumer) => consumer.totalRuns > 1);

  return (
    <div className="text-left">
      <div className="mb-1 font-semibold">
        {formatQuantity(quantity, exact)}× {name}
      </div>
      <div className="mb-1 text-xs text-gray-300">Used per run:</div>
      <div className="text-xs">
        {consumers.map((consumer) => (
          <div key={consumer.typeId} className="pl-3">
            {formatQuantity(consumer.quantityPerRun, exact)}× → {consumer.name}
          </div>
        ))}
      </div>
      {showTotal && (
        <div className="mt-1 border-t border-gray-600 pt-1">
          <div className="text-xs text-gray-300">Total:</div>
          <div className="text-xs">
            {consumers.map((consumer) => (
              <div key={consumer.typeId} className="pl-3">
                {formatQuantity(consumer.totalQuantity, exact)}× → {consumer.name} ({formatQuantity(consumer.totalRuns, exact)} runs)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { SummaryTooltipContent };
