import type { FC } from 'react';
import { Label, Select, Spinner, TextInput } from 'flowbite-react';
import { useMemo } from 'react';
import type { CommodityType } from '../../types';
import { TIERS } from '../../types';

type CommoditySelectorProps = {
  commodities: CommodityType[];
  loading: boolean;
  selectedTypeId: number | null;
  onSelect: (typeId: number | null) => void;
  desiredQuantity: number;
  onQuantityChange: (quantity: number) => void;
};

const CommoditySelector: FC<CommoditySelectorProps> = ({ commodities, loading, selectedTypeId, onSelect, desiredQuantity, onQuantityChange }) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSelect(value ? Number(value) : null);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onQuantityChange(Number.isNaN(val) || val < 1 ? 1 : val);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Spinner size="sm" />
        <span>Loading commodities...</span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-4">
      <div className="max-w-md flex-1">
        <Label htmlFor="commodity-select" className="mb-2 block text-white">
          Commodity
        </Label>
        <Select id="commodity-select" value={selectedTypeId ?? ''} onChange={handleChange}>
          <option value="">-- Choose a commodity --</option>
          {[...TIERS]
            .filter((tier) => tier.tier !== 'r0')
            .reverse()
            .map((tier) => {
              const items = grouped.get(tier.groupIds[0]);
              if (!items?.length) {
                return null;
              }
              return (
                <optgroup key={tier.groupIds[0]} label={tier.label}>
                  {items.map((item) => (
                    <option key={item.type_id} value={item.type_id}>
                      {item.name.en}
                    </option>
                  ))}
                </optgroup>
              );
            })}
        </Select>
      </div>
      <div className="w-28">
        <Label htmlFor="quantity-input" className="mb-2 block text-white">
          Quantity
        </Label>
        <TextInput id="quantity-input" type="number" min={1} value={desiredQuantity} onChange={handleQuantityChange} />
      </div>
    </div>
  );
};

export default CommoditySelector;
