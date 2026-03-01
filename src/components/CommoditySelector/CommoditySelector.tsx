import type { FC } from 'react';
import { Spinner } from 'flowbite-react';
import { useMemo } from 'react';
import type { CommoditySelection, CommodityType, MarginInfo, MarketPrice } from '../../types';
import CommoditySelectorRow from './CommoditySelectorRow';

type CommoditySelectorProps = {
  commodities: CommodityType[];
  loading: boolean;
  prices: Map<number, MarketPrice>;
  pricesLoading: boolean;
  margins: Map<number, MarginInfo>;
  selections: CommoditySelection[];
  onSelectCommodity: (selectionId: number, typeId: number | null) => void;
  onQuantityChange: (selectionId: number, quantity: number) => void;
  onAddSelection: () => void;
  onRemoveSelection: (selectionId: number) => void;
};

const CommoditySelector: FC<CommoditySelectorProps> = ({
  commodities,
  loading,
  prices,
  pricesLoading,
  margins,
  selections,
  onSelectCommodity,
  onQuantityChange,
  onAddSelection,
  onRemoveSelection,
}) => {
  const grouped = useMemo(() => {
    const map = new Map<number, CommodityType[]>();
    for (const commodity of commodities) {
      const group = map.get(commodity.group_id) ?? [];
      group.push(commodity);
      map.set(commodity.group_id, group);
    }

    // Sort commodities within each group alphabetically
    for (const [, items] of map) {
      items.sort((a, b) => a.name.en.localeCompare(b.name.en));
    }

    return map;
  }, [commodities]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Spinner size="sm" />
        <span>Loading commodities...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {selections.map((selection, index) => (
        <CommoditySelectorRow
          key={selection.id}
          grouped={grouped}
          prices={prices}
          pricesLoading={pricesLoading}
          margins={margins}
          selection={selection}
          showLabels={index === 0}
          canRemove={selections.length > 1}
          onSelectCommodity={(typeId) => onSelectCommodity(selection.id, typeId)}
          onQuantityChange={(quantity) => onQuantityChange(selection.id, quantity)}
          onRemove={() => onRemoveSelection(selection.id)}
        />
      ))}
      <div>
        <button onClick={onAddSelection} className="text-sm text-blue-400 hover:text-blue-300">
          + Add commodity
        </button>
      </div>
    </div>
  );
};

export default CommoditySelector;
