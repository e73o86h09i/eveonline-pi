import type { FC } from 'react';
import { Label, Select, TextInput } from 'flowbite-react';
import type { CommoditySelection, CommodityType } from '../../types';
import { TIERS } from '../../types';

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
  const selectId = `commodity-select-${selection.id}`;
  const quantityId = `quantity-input-${selection.id}`;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onSelectCommodity(value ? Number(value) : null);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(event.target.value, 10);
    onQuantityChange(Number.isNaN(parsed) || parsed < 1 ? 1 : parsed);
  };

  return (
    <div className="flex items-end gap-4">
      <div className="max-w-md flex-1">
        {showLabels && (
          <Label htmlFor={selectId} className="mb-2 block text-white">
            Commodity
          </Label>
        )}
        <Select id={selectId} value={selection.typeId ?? ''} onChange={handleChange}>
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
