import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';
import { Badge, Card } from 'flowbite-react';
import type { ProductionNode, Tier } from '../../types';
import { usePlanets } from '../../hooks';
import { CommodityIcon } from '../common/CommodityIcon';
import { useProductionTree } from './ProductionTreeContext';
import { findConsumers, findNode, formatDuration, formatQuantity, sortByTier, tierColors, totalQuantity } from './utils';

type InfoCardProps = {
  typeId: number;
  name: string;
  tier: Tier;
  flashKey: number;
  initialPosition: { x: number; y: number };
  onClose: () => void;
  onBringToFront: () => void;
  onOpenCard: (event: React.MouseEvent, typeId: number, name: string, tier: Tier) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
};

const InfoCard: FC<InfoCardProps> = ({ typeId, name, tier, flashKey, initialPosition, onClose, onBringToFront, onOpenCard, onPositionChange }) => {
  const { trees, exactNumbers } = useProductionTree();
  const [position, setPosition] = useState(initialPosition);
  const positionRef = useRef(initialPosition);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cardElRef = useRef<HTMLDivElement | null>(null);
  const hasBeenDraggedRef = useRef(false);

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
  const { planets, loading: planetsLoading } = usePlanets(isRawResource ? typeId : null);

  const handleCardRef = useCallback(
    (element: HTMLDivElement | null) => {
      cardElRef.current = element;

      if (!element || hasBeenDraggedRef.current) {
        return;
      }

      const gap = 10;
      const rect = element.getBoundingClientRect();
      let { x, y } = positionRef.current;
      let adjusted = false;

      if (x < gap) {
        x = gap;
        adjusted = true;
      } else if (x + rect.width > window.innerWidth - gap) {
        x = Math.max(gap, window.innerWidth - rect.width - gap);
        adjusted = true;
      }

      if (y < gap) {
        y = gap;
        adjusted = true;
      } else if (y + rect.height > window.innerHeight - gap) {
        y = Math.max(gap, window.innerHeight - rect.height - gap);
        adjusted = true;
      }

      if (adjusted) {
        const clamped = { x, y };
        positionRef.current = clamped;
        setPosition(clamped);
        onPositionChange(clamped);
      }
    },
    // planetsLoading is intentionally included to re-trigger clamping when card height changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPositionChange, planetsLoading],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest('button') || target.closest('[data-clickable]')) {
        return;
      }

      onBringToFront();

      dragStartRef.current = { x: event.clientX - position.x, y: event.clientY - position.y };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const next = {
          x: moveEvent.clientX - dragStartRef.current.x,
          y: moveEvent.clientY - dragStartRef.current.y,
        };
        positionRef.current = next;
        setPosition(next);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        hasBeenDraggedRef.current = true;
        onPositionChange(positionRef.current);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [position.x, position.y, onBringToFront, onPositionChange],
  );

  const outputPerRun = node?.outputPerRun ?? 1;
  const cycleTime = node?.cycleTime ?? 0;
  const quantity = totalQuantity(trees, typeId);
  const runs = cycleTime > 0 ? quantity / outputPerRun : 0;
  const totalTime = cycleTime * runs;

  // Derive per-run input quantities from the node's own data (schematic-accurate)
  const nodeRuns = node && cycleTime > 0 ? node.quantity / outputPerRun : 0;
  const sortedInputs = node ? sortByTier(node.inputs) : [];
  const perRun = sortedInputs.map((input) => ({
    typeId: input.typeId,
    name: input.name,
    tier: input.tier,
    qty: nodeRuns > 0 ? input.quantity / nodeRuns : 0,
  }));

  return (
    <div
      ref={handleCardRef}
      className="fixed z-50 w-80 cursor-move select-none shadow-2xl"
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      {<div key={flashKey} className="animate-info-card-flash pointer-events-none absolute inset-0 rounded-lg" />}
      <Card className="border-gray-600 bg-gray-800">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge color={tierColors[tier] ?? tierColors.r0} className="uppercase">
              {tier}
            </Badge>
            <CommodityIcon typeId={typeId} name={name} />
            <span className="font-bold text-white">{name}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-6 h-6 -mt-6 -mr-6 rounded text-gray-400 hover:bg-red-700 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 space-y-3 text-sm">
          {/* Quantity summary */}
          <div className="text-gray-300">
            Total: <span className="font-semibold text-white">{formatQuantity(quantity, exactNumbers)}×</span>
            {runs > 0 && (
              <span className="ml-2 text-gray-400">
                ({formatQuantity(runs, exactNumbers)} {runs === 1 ? 'run' : 'runs'}, {formatDuration(totalTime)})
              </span>
            )}
          </div>

          {/* Production formula */}
          {!isRawResource && (
            <div className="border-t border-gray-700 pt-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Recipe (per run, {formatDuration(cycleTime)})</div>
              <div className="space-y-1 text-gray-300">
                <div className="font-medium text-white">
                  {outputPerRun}× {name} =
                </div>
                {perRun.map((input) => (
                  <div key={input.name} className="flex items-center gap-1 pl-3">
                    <Badge color={tierColors[input.tier] ?? tierColors.r0} size="xs" className="uppercase">
                      {input.tier}
                    </Badge>
                    <span>
                      {formatQuantity(input.qty, exactNumbers)}×{' '}
                      <span
                        data-clickable
                        className="cursor-pointer border-b border-dashed border-gray-600 hover:text-blue-400"
                        onClick={(event) => onOpenCard(event, input.typeId, input.name, input.tier)}
                      >
                        {input.name}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              {runs > 1 && (
                <div className="mt-2 text-xs text-gray-400">
                  Total inputs ({formatQuantity(runs, exactNumbers)} runs):
                  {perRun.map((input) => (
                    <div key={input.name} className="pl-3">
                      {formatQuantity(input.qty * runs, exactNumbers)}×{' '}
                      <span
                        data-clickable
                        className="cursor-pointer border-b border-dashed border-gray-600 hover:text-blue-400"
                        onClick={(event) => onOpenCard(event, input.typeId, input.name, input.tier)}
                      >
                        {input.name}
                      </span>
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
              <div className="space-y-1.5 text-gray-300">
                {consumers.map((consumer) => (
                  <div key={consumer.typeId} className="flex items-center gap-1">
                    <Badge color={tierColors[consumer.tier] ?? tierColors.r0} size="xs" className="uppercase">
                      {consumer.tier}
                    </Badge>
                    <span>
                      <span
                        data-clickable
                        className="cursor-pointer border-b border-dashed border-gray-600 hover:text-blue-400"
                        onClick={(event) => onOpenCard(event, consumer.typeId, consumer.name, consumer.tier)}
                      >
                        {consumer.name}
                      </span>
                      : {formatQuantity(consumer.quantityPerRun, exactNumbers)}× / run
                      {consumer.totalRuns > 1 && (
                        <span className="ml-1 text-gray-400">
                          ({formatQuantity(consumer.totalQuantity, exactNumbers)}× total, {formatQuantity(consumer.totalRuns, exactNumbers)} runs)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw resource — planet info */}
          {isRawResource && (
            <div className="border-t border-gray-700 pt-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Harvested on</div>
              {planetsLoading ? (
                <div className="text-gray-500">Loading planets…</div>
              ) : planets.length > 0 ? (
                <div className="space-y-1 text-gray-300">
                  {planets.map((planet) => (
                    <div key={planet.typeId} className="flex items-center gap-2">
                      <CommodityIcon typeId={planet.typeId} name={planet.name} />
                      <span>{planet.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No planet data available</div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export { InfoCard };
