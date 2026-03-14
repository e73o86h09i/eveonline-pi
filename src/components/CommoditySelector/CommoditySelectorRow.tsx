import { type FC, useCallback, useMemo, useState } from 'react';
import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem, Label, TextInput } from 'flowbite-react';
import { type CommoditySelection, type CommodityType, TIERS } from '../../types';
import { CommodityIcon } from '../common/CommodityIcon';
import { usePICalculator } from '../PICalculator/PICalculatorContext';
import { formatIsk, parsePrices } from '../../utils';

type CommoditySelectorRowProps = {
  grouped: Map<number, CommodityType[]>;
  selection: CommoditySelection;
  showLabels: boolean;
  canRemove: boolean;
  onSelectCommodity: (typeId: number | null) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

const CommoditySelectorRow: FC<CommoditySelectorRowProps> = ({ grouped, selection, showLabels, canRemove, onSelectCommodity, onQuantityChange, onRemove }) => {
  const { prices, pricesLoading, margins, exactPrices } = usePICalculator();
  const quantityId = `quantity-input-${selection.id}`;
  const [search, setSearch] = useState('');

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }, []);

  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
  }, []);

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

  const searchLower = search.toLowerCase();

  const filteredGrouped = useMemo(() => {
    if (!searchLower) {
      return grouped;
    }

    const filtered = new Map<number, CommodityType[]>();
    for (const [groupId, items] of grouped) {
      const matching = items.filter((item) => item.name.en.toLowerCase().includes(searchLower));
      if (matching.length > 0) {
        filtered.set(groupId, matching);
      }
    }

    return filtered;
  }, [grouped, searchLower]);

  const renderTrigger = () => (
    <button
      type="button"
      className="flex w-full items-center rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-left text-sm hover:border-gray-500"
    >
      <span className={`min-w-0 flex-1 truncate ${selectedName ? 'text-white' : 'text-gray-400'}`}>{selectedName ?? '-- Choose a commodity --'}</span>
      {selectedName && (
        <span
          role="button"
          className="ml-2 shrink-0 text-gray-400 hover:text-white"
          onClick={(event) => {
            event.stopPropagation();
            onSelectCommodity(null);
          }}
          aria-label="Clear selection"
        >
          ✕
        </span>
      )}
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
          <div className="sticky top-0 z-10 bg-gray-700 p-2">
            <div className="relative">
              <TextInput
                type="text"
                placeholder="Search..."
                value={search}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                sizing="sm"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          {tiers.map((tier, tierIndex) => {
            const items = filteredGrouped.get(tier.groupIds[0]);
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
                    <DropdownItem
                      key={item.type_id}
                      onClick={() => {
                        onSelectCommodity(item.type_id);
                        setSearch('');
                      }}
                    >
                      <div className="flex w-full items-center gap-2 text-left">
                        <CommodityIcon typeId={item.type_id} name={item.name.en} />
                        <div className="flex flex-col">
                          <span>{item.name.en}</span>
                          {pricesLoading ? (
                            <span className="text-xs text-gray-500">…</span>
                          ) : buyMax || sellMin ? (
                            <span className="text-xs">
                              {buyMax ? <span className="text-green-400">{formatIsk(buyMax, exactPrices)}</span> : <span className="text-gray-500">n/a</span>}
                              <span className="text-gray-500"> / </span>
                              {sellMin ? (
                                <span className="text-yellow-400">{formatIsk(sellMin, exactPrices)}</span>
                              ) : (
                                <span className="text-gray-500">n/a</span>
                              )}
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

export { CommoditySelectorRow };
