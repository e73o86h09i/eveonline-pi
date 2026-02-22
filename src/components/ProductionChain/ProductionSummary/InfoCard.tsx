import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import { Badge, Card } from 'flowbite-react';
import type { ProductionNode, Tier } from '../../../types';
import { findConsumers, findNode, formatDuration, formatQuantity, sortByTier, tierColors } from '../utils';

type InfoCardProps = {
  trees: ProductionNode[];
  typeId: number;
  name: string;
  tier: Tier;
  quantity: number;
  exact: boolean;
  initialPosition: { x: number; y: number };
  onClose: () => void;
};

const InfoCard: FC<InfoCardProps> = ({ trees, typeId, name, tier, quantity, exact, initialPosition, onClose }) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).closest('button')) {
        return;
      }

      setIsDragging(true);
      dragStartRef.current = { x: event.clientX - position.x, y: event.clientY - position.y };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        setPosition({
          x: moveEvent.clientX - dragStartRef.current.x,
          y: moveEvent.clientY - dragStartRef.current.y,
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [position.x, position.y],
  );

  // Find the node to get schematic info
  let node: ProductionNode | null = null;
  for (const tree of trees) {
    node = findNode(tree, typeId);
    if (node) {
      break;
    }
  }

  const consumers = findConsumers(trees, typeId);
  const isRawResource = !node || node.inputs.length === 0;
  const outputPerRun = node?.outputPerRun ?? 1;
  const cycleTime = node?.cycleTime ?? 0;
  const runs = cycleTime > 0 ? quantity / outputPerRun : 0;
  const totalTime = cycleTime * runs;

  const sortedInputs = node ? sortByTier(node.inputs) : [];
  const perRun = sortedInputs.map((input) => ({
    name: input.name,
    tier: input.tier,
    qty: runs > 0 ? input.quantity / runs : 0,
  }));

  return (
    <div
      ref={cardRef}
      className="fixed z-50 w-80 cursor-move select-none shadow-2xl"
      style={{ left: position.x, top: position.y, opacity: isDragging ? 0.9 : 1 }}
      onMouseDown={handleMouseDown}
    >
      <Card className="border-gray-600 bg-gray-800">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge color={tierColors[tier] ?? tierColors.r0} className="uppercase">
              {tier}
            </Badge>
            <span className="font-bold text-white">{name}</span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-white" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="mt-3 space-y-3 text-sm">
          {/* Quantity summary */}
          <div className="text-gray-300">
            Total: <span className="font-semibold text-white">{formatQuantity(quantity, exact)}×</span>
            {runs > 0 && (
              <span className="ml-2 text-gray-400">
                ({formatQuantity(runs, exact)} {runs === 1 ? 'run' : 'runs'}, {formatDuration(totalTime)})
              </span>
            )}
          </div>

          {/* Production formula */}
          {!isRawResource && (
            <div className="border-t border-gray-700 pt-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Recipe (per run, {formatDuration(cycleTime)})</div>
              <div className="text-gray-300">
                <div className="font-medium text-white">
                  {outputPerRun}× {name} =
                </div>
                {perRun.map((input) => (
                  <div key={input.name} className="flex items-center gap-1 pl-3">
                    <Badge color={tierColors[input.tier] ?? tierColors.r0} size="xs" className="uppercase">
                      {input.tier}
                    </Badge>
                    <span>
                      {formatQuantity(input.qty, exact)}× {input.name}
                    </span>
                  </div>
                ))}
              </div>
              {runs > 1 && (
                <div className="mt-2 text-xs text-gray-400">
                  Total inputs ({formatQuantity(runs, exact)} runs):
                  {sortedInputs.map((input) => (
                    <div key={input.name} className="pl-3">
                      {formatQuantity(input.quantity, exact)}× {input.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Consumers (where used) */}
          {consumers.length > 0 && (
            <div className="border-t border-gray-700 pt-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Used by</div>
              <div className="space-y-1 text-gray-300">
                {consumers.map((consumer) => (
                  <div key={consumer.typeId} className="flex items-center gap-1">
                    <Badge color={tierColors[consumer.tier] ?? tierColors.r0} size="xs" className="uppercase">
                      {consumer.tier}
                    </Badge>
                    <span>
                      {consumer.name}: {formatQuantity(consumer.quantityPerRun, exact)}×/run
                      {consumer.totalRuns > 1 && (
                        <span className="ml-1 text-gray-400">
                          ({formatQuantity(consumer.totalQuantity, exact)}× total, {formatQuantity(consumer.totalRuns, exact)} runs)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw resource notice */}
          {isRawResource && <div className="border-t border-gray-700 pt-3 text-gray-400">Raw resource, extracted from planets</div>}
        </div>
      </Card>
    </div>
  );
};

export { InfoCard };
