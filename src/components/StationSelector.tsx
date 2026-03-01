import type { FC } from 'react';
import { Dropdown, DropdownItem } from 'flowbite-react';
import { TRADE_STATIONS } from '../types';

type StationSelectorProps = {
  stationId: number;
  onStationChange: (stationId: number) => void;
};

const StationSelector: FC<StationSelectorProps> = ({ stationId, onStationChange }) => {
  const selected = TRADE_STATIONS.find((station) => station.id === stationId);

  return (
    <Dropdown label={selected?.name ?? 'Select station'} size="sm" color="gray">
      {TRADE_STATIONS.map((station) => (
        <DropdownItem key={station.id} onClick={() => onStationChange(station.id)}>
          {station.name}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};

export { StationSelector };
