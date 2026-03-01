import type { FC } from 'react';
import { useMemo } from 'react';
import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem, Label, TextInput } from 'flowbite-react';
import type { CommoditySelection, CommodityType, MarginInfo, MarketPrice } from '../../types';
import { TIERS } from '../../types';
import { CommodityIcon } from '../common/CommodityIcon';
import { formatIsk, parsePrices } from '../utils';

type CommoditySelectorRowProps = {
  grouped: Map<number, CommodityType[]>;
  prices: Map<number, MarketPrice>;
  pricesLoading: boolean;
  margins: Map<number, MarginInfo>;
  selection: CommoditySelection;
  showLabels: boolean;
  canRemove: boolean;
  onSelectCommodity: (typeId: number | null) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

const CommoditySelectorRow: FC<CommoditySelectorRowProps> = ({
  grouped,
  prices,
  pricesLoading,
  margins,
  selection,
  showLabels,
  canRemove,
  onSelectCommodity,
  onQuantityChange,
  onRemove,
}) => {
  const quantityId = `quantity-input-${selection.id}`;

  const selectedName = useMemo(() => {
    if (selection.typeId === null) {
      return null;
    }

    for (const [, items] of grouped) {
      const found = items.find((item) => item.type_id === selection.typeId);
      if (found) {
        return found.name.en;
      }
    }

    return null;
  }, [grouped, selection.typeId]);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(event.target.value, 10);
    onQuantityChange(Number.isNaN(parsed) || parsed < 1 ? 1 : parsed);
  };

  const tiers = useMemo(() => [...TIERS].filter((tier) => tier.tier !== 'r0').reverse(), []);

  const renderTrigger = () => (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-left text-sm text-white hover:border-gray-500"
    >
      <span className={selectedName ? 'text-white' : 'text-gray-400'}>{selectedName ?? '-- Choose a commodity --'}</span>
      <svg className="ml-2 h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  return (
    <div className="flex items-end gap-4">
      <div className="max-w-md flex-1">
        {showLabels && <Label className="mb-2 block text-white">Commodity</Label>}
        <Dropdown label="" renderTrigger={renderTrigger} className="max-h-80 overflow-y-auto">
          <DropdownItem onClick={() => onSelectCommodity(null)}>
            <span className="text-gray-400">-- Choose a commodity --</span>
          </DropdownItem>
          {tiers.map((tier, tierIndex) => {
            const items = grouped.get(tier.groupIds[0]);
            if (!items?.length) {
              return null;
            }

            return (
              <div key={tier.groupIds[0]}>
                {tierIndex > 0 && <DropdownDivider />}
                <DropdownHeader>
                  <span className="font-semibold text-gray-300">{tier.label}</span>
                </DropdownHeader>
                {items.map((item) => {
                  const { buyMax, sellMin } = parsePrices(prices.get(item.type_id));
                  const marginInfo = margins.get(item.type_id);

                  return (
                    <DropdownItem key={item.type_id} onClick={() => onSelectCommodity(item.type_id)}>
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CommodityIcon typeId={item.type_id} name={item.name.en} />
                          <span>{item.name.en}</span>
                        </div>
                        {pricesLoading ? (
                          <span className="text-xs text-gray-500">…</span>
                        ) : buyMax || sellMin ? (
                          <span className="shrink-0 text-xs">
                            {buyMax ? <span className="text-green-400">{formatIsk(buyMax)}</span> : <span className="text-gray-500">n/a</span>}
                            <span className="text-gray-500"> / </span>
                            {sellMin ? <span className="text-yellow-400">{formatIsk(sellMin)}</span> : <span className="text-gray-500">n/a</span>}
                            {marginInfo ? (
                              <span className={marginInfo.margin >= 0 ? 'ml-1 text-green-400' : 'ml-1 text-red-400'}>
                                ({marginInfo.margin >= 0 ? '+' : ''}
                                {marginInfo.marginPercent.toFixed(1)}%)
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">n/a</span>
                        )}
                      </div>
                    </DropdownItem>
                  );
                })}
              </div>
            );
          })}
        </Dropdown>
      </div>
      <div className="w-28">
        {showLabels && (
          <Label htmlFor={quantityId} className="mb-2 block text-white">
            Quantity
          </Label>
        )}
        <TextInput id={quantityId} type="number" min={1} value={selection.quantity} onChange={handleQuantityChange} />
      </div>
      {canRemove && (
        <button onClick={onRemove} className="rounded-lg p-2.5 text-sm text-gray-400 hover:bg-gray-700 hover:text-white" aria-label="Remove commodity">
          ✕
        </button>
      )}
    </div>
  );
};

export default CommoditySelectorRow;
