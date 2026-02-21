import { Label, Select, Spinner } from "flowbite-react";
import { useMemo } from "react";
import type { CommodityType } from "../../types";
import { TIERS } from "../../types";

type CommoditySelectorProps = {
  commodities: CommodityType[];
  loading: boolean;
  selectedTypeId: number | null;
  onSelect: (typeId: number | null) => void;
};

export function CommoditySelector({
  commodities,
  loading,
  selectedTypeId,
  onSelect,
}: CommoditySelectorProps) {
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Spinner size="sm" />
        <span>Loading commodities...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <Label htmlFor="commodity-select" className="mb-2 block text-white">
        Select a commodity to see its production chain
      </Label>
      <Select
        id="commodity-select"
        value={selectedTypeId ?? ""}
        onChange={handleChange}
      >
        <option value="">-- Choose a commodity --</option>
        {TIERS.map((tier) => {
          const items = grouped.get(tier.groupId);
          if (!items?.length) return null;
          return (
            <optgroup key={tier.groupId} label={tier.label}>
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
  );
}
