import type { FC } from 'react';
import { Fragment, useMemo } from 'react';
import { Badge, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import type { ProductionNode } from '../../types';
import { TIERS } from '../../types';
import { useProductionTree } from './ProductionTreeContext';
import { findCycleTime, formatDuration, formatQuantity, summarizeTree, tierColors } from './utils';

type ProductionSummaryProps = {
  tree: ProductionNode;
};

const tierLabels: Record<string, string> = Object.fromEntries(TIERS.map((t) => [t.tier, t.label]));

const ProductionSummary: FC<ProductionSummaryProps> = ({ tree }) => {
  const { exactNumbers } = useProductionTree();
  const entries = useMemo(() => summarizeTree(tree), [tree]);

  if (entries.length === 0) {
    return <p className="text-gray-400">No intermediate materials needed.</p>;
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
        <TableRow className="border-gray-700 bg-gray-800">
          <TableCell className="w-16">
            <Badge color={tierColors[tree.tier] ?? tierColors.r0} className="uppercase">
              {tree.tier}
            </Badge>
          </TableCell>
          <TableCell className="font-semibold text-white">{tree.name}</TableCell>
          <TableCell className="text-right text-gray-300">{formatQuantity(tree.quantity, exactNumbers)}</TableCell>
          <TableCell className="text-right text-gray-400">
            {tree.cycleTime != null ? formatDuration(findCycleTime(tree, tree.typeId, tree.quantity)) : '—'}
          </TableCell>
        </TableRow>
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
                <TableCell className="font-medium text-white">{entry.name}</TableCell>
                <TableCell className="text-right text-gray-300">{formatQuantity(entry.quantity, exactNumbers)}</TableCell>
                <TableCell className="text-right text-gray-400">
                  {entry.tier !== 'r0' ? formatDuration(findCycleTime(tree, entry.typeId, entry.quantity)) : '—'}
                </TableCell>
              </TableRow>
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export { ProductionSummary };
