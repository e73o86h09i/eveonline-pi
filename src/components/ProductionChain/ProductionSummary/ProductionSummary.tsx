import { type FC, Fragment, useMemo } from 'react';
import { Badge, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import { type Tier, TIERS } from '../../../types';
import { CommodityIcon } from '../../common/CommodityIcon';
import { formatDuration, formatIsk, formatQuantity, parsePrices, sortByTier, tierColors } from '../../../utils';
import { usePICalculator } from '../../PICalculator/PICalculatorContext';
import { type SummaryEntry, findCycleTime, summarizeTrees } from '../utils';

type ProductionSummaryProps = {
  onOpenCard: (event: React.MouseEvent, typeId: number, name: string, tier: Tier) => void;
};

const tierLabels: Record<string, string> = Object.fromEntries(TIERS.map((tier) => [tier.tier, tier.label]));

const ProductionSummary: FC<ProductionSummaryProps> = ({ onOpenCard }) => {
  const { trees, exactNumbers, exactPrices, prices, pricesLoading, margins } = usePICalculator();
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
    <>
      <Table hoverable className="border-gray-700">
        <TableHead>
          <TableRow>
            <TableHeadCell className="bg-gray-700 text-gray-300">Tier</TableHeadCell>
            <TableHeadCell className="bg-gray-700 text-gray-300">Commodity</TableHeadCell>
            <TableHeadCell className="bg-gray-700 text-gray-300 text-right">Quantity</TableHeadCell>
            <TableHeadCell className="bg-gray-700 text-gray-300 text-right">Buy / Sell</TableHeadCell>
            <TableHeadCell className="bg-gray-700 text-gray-300 text-right">Margin/run</TableHeadCell>
            <TableHeadCell className="bg-gray-700 text-gray-300 text-right">Time</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y divide-gray-700">
          <TableRow className="bg-gray-800/50">
            <TableCell colSpan={6} className="py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Target
            </TableCell>
          </TableRow>
          {targetProducts.map((target) => {
            const cycleTime = findCycleTime(trees, target.typeId, target.quantity);
            const { buyMax, sellMin } = parsePrices(prices.get(target.typeId));
            const marginInfo = margins.get(target.typeId) ?? null;

            return (
              <TableRow key={target.typeId} className="border-gray-700 bg-gray-800">
                <TableCell className="w-16">
                  <Badge color={tierColors[target.tier] ?? tierColors.r0} className="uppercase">
                    {target.tier}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-white">
                  <div className="flex items-center gap-2">
                    <CommodityIcon typeId={target.typeId} name={target.name} />
                    <button
                      onClick={(event) => onOpenCard(event, target.typeId, target.name, target.tier)}
                      className="cursor-pointer border-b border-dashed border-gray-600 hover:text-blue-400"
                    >
                      {target.name}
                    </button>
                  </div>
                </TableCell>
                <TableCell className="text-right text-gray-300">{formatQuantity(target.quantity, exactNumbers)}</TableCell>
                <TableCell className="text-right">
                  {pricesLoading ? (
                    <span className="text-gray-500">…</span>
                  ) : (
                    <span className="text-xs">
                      {buyMax ? <span className="text-green-400">{formatIsk(buyMax, exactPrices)}</span> : <span className="text-gray-500">n/a</span>}
                      <span className="text-gray-500"> / </span>
                      {sellMin ? <span className="text-yellow-400">{formatIsk(sellMin, exactPrices)}</span> : <span className="text-gray-500">n/a</span>}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {pricesLoading ? (
                    <span className="text-gray-500">…</span>
                  ) : marginInfo ? (
                    <span className={marginInfo.margin >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {marginInfo.margin >= 0 ? '+' : ''}
                      {marginInfo.marginPercent.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-gray-400">{cycleTime > 0 ? formatDuration(cycleTime) : '—'}</TableCell>
              </TableRow>
            );
          })}
          {entries.map((entry, idx) => {
            const color = tierColors[entry.tier] ?? tierColors.r0;
            const showTierHeader = idx === 0 || entries[idx - 1].tier !== entry.tier;
            const { buyMax: entryBuyMax, sellMin: entrySellMin } = parsePrices(prices.get(entry.typeId));
            const entryMargin = margins.get(entry.typeId) ?? null;

            return (
              <Fragment key={entry.typeId}>
                {showTierHeader && (
                  <TableRow className="bg-gray-800/50">
                    <TableCell colSpan={6} className="py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                    <div className="flex items-center gap-2">
                      <CommodityIcon typeId={entry.typeId} name={entry.name} />
                      <button
                        onClick={(event) => onOpenCard(event, entry.typeId, entry.name, entry.tier)}
                        className="cursor-pointer border-b border-dashed border-gray-600 hover:text-blue-400"
                      >
                        {entry.name}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-gray-300">{formatQuantity(entry.quantity, exactNumbers)}</TableCell>
                  <TableCell className="text-right">
                    {pricesLoading ? (
                      <span className="text-gray-500">…</span>
                    ) : (
                      <span className="text-xs">
                        {entryBuyMax ? (
                          <span className="text-green-400">{formatIsk(entryBuyMax, exactPrices)}</span>
                        ) : (
                          <span className="text-gray-500">n/a</span>
                        )}
                        <span className="text-gray-500"> / </span>
                        {entrySellMin ? (
                          <span className="text-yellow-400">{formatIsk(entrySellMin, exactPrices)}</span>
                        ) : (
                          <span className="text-gray-500">n/a</span>
                        )}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {pricesLoading ? (
                      <span className="text-gray-500">…</span>
                    ) : entryMargin ? (
                      <span className={entryMargin.margin >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {entryMargin.margin >= 0 ? '+' : ''}
                        {entryMargin.marginPercent.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-gray-400">
                    {entry.tier !== 'r0' ? formatDuration(findCycleTime(trees, entry.typeId, entry.quantity)) : '—'}
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export { ProductionSummary };
