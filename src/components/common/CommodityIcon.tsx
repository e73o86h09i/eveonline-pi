import type { FC } from 'react';

type CommodityIconProps = {
  typeId: number;
  name: string;
};

const CommodityIcon: FC<CommodityIconProps> = ({ typeId, name }) => (
  <img src={`https://images.evetech.net/types/${typeId}/icon?size=32`} alt={name} width={32} height={32} className="inline-block rounded" loading="lazy" />
);

export { CommodityIcon };
