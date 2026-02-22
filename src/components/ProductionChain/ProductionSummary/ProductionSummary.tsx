import type { FC } from 'react';
import { Fragment, useMemo } from 'react';
import { Badge, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Tooltip } from 'flowbite-react';
import type { ProductionNode } from '../../../types';
import { TIERS } from '../../../types';
import { useProductionTree } from '../ProductionTreeContext';
import { type SummaryEntry, findCycleTime, formatDuration, formatQuantity, sortByTier, summarizeTrees, tierColors } from '../utils';
import { SummaryTooltipContent } from './SummaryTooltipContent';

type ProductionSummaryProps = {
  trees: ProductionNode[];
};

const tierLabels: Record<string, string> = Object.fromEntries(TIERS.map((tier) => [tier.tier, tier.label]));

const ProductionSummary: FC<ProductionSummaryProps> = ({ trees }) => {
  const { exactNumbers } = useProductionTree();
  const entries = useMemo(() => summarizeTrees(trees), [trees]);

  const targetProducts = useMemo(() => {
    const map = new Map<number, SummaryEntry>();
    for (const tree of trees) {
      const existing = map.get(tree.typeId);
      if (existing) {
        existing.quantity += tree.quantity;
      } else {
        map.set(tree.typeId, { typeId: tree.typeId, name: tree.name, tier: tree.tier, quantity: tree.quantity });
      }
    }

    return sortByTier([...map.values()]);
  }, [trees]);

  if (targetProducts.length === 0) {
    return <p className="text-gray-400">No commodities selected.</p>;
  }

  return (
    <Table hoverable className="border-gray-700">
      <TableHead>
        <TableRow>
          <TableHeadCell className="bg-gray-700 text-gray-300">Tier</TableHeadCell>
          <TableHeadCell className="bg-gray-700 text-gray-300">Commodity</TableHeadCell>
          <TableHeadCell className="bg-gray-700 text-gray-300 text-right">Quantity</TableHeadCell>
          <TableHeadCell className="bg-gray-700 text-gray-300 text-right">Time</TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody className="divide-y divide-gray-700">
        <TableRow className="bg-gray-800/50">
          <TableCell colSpan={4} className="py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Target
          </TableCell>
        </TableRow>
        {targetProducts.map((target) => {
          const cycleTime = findCycleTime(trees, target.typeId, target.quantity);

          return (
            <TableRow key={target.typeId} className="border-gray-700 bg-gray-800">
              <TableCell className="w-16">
                <Badge color={tierColors[target.tier] ?? tierColors.r0} className="uppercase">
                  {target.tier}
                </Badge>
              </TableCell>
              <TableCell className="font-semibold text-white">{target.name}</TableCell>
              <TableCell className="text-right text-gray-300">{formatQuantity(target.quantity, exactNumbers)}</TableCell>
              <TableCell className="text-right text-gray-400">{cycleTime > 0 ? formatDuration(cycleTime) : '—'}</TableCell>
            </TableRow>
          );
        })}
        {entries.map((entry, idx) => {
          const color = tierColors[entry.tier] ?? tierColors.r0;
          const showTierHeader = idx === 0 || entries[idx - 1].tier !== entry.tier;

          return (
            <Fragment key={entry.typeId}>
              {showTierHeader && (
                <TableRow className="bg-gray-800/50">
                  <TableCell colSpan={4} className="py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {tierLabels[entry.tier] ?? entry.tier}
                  </TableCell>
                </TableRow>
              )}
              <TableRow className="border-gray-700 bg-gray-800">
                <TableCell className="w-16">
                  <Badge color={color} className="uppercase">
                    {entry.tier}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-white">
                  <Tooltip
                    content={<SummaryTooltipContent trees={trees} typeId={entry.typeId} name={entry.name} quantity={entry.quantity} exact={exactNumbers} />}
                    style="dark"
                    placement="right"
                  >
                    <span className="cursor-help border-b border-dashed border-gray-600">{entry.name}</span>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-right text-gray-300">{formatQuantity(entry.quantity, exactNumbers)}</TableCell>
                <TableCell className="text-right text-gray-400">
                  {entry.tier !== 'r0' ? formatDuration(findCycleTime(trees, entry.typeId, entry.quantity)) : '—'}
                </TableCell>
              </TableRow>
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default ProductionSummary;
