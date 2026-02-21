import { useCallback, useEffect, useState } from "react";
import type { CommodityType } from "../types";
import { fetchAllCommodities } from "../api";

export function useCommodities() {
  const [commodities, setCommodities] = useState<CommodityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchAllCommodities()
      .then((data) => {
        if (!cancelled) {
          setCommodities(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { commodities, loading, error };
}

import type { ProductionNode, Tier } from "../types";
import { fetchSchematic, fetchType } from "../api";
import { TIERS } from "../types";

function getTierByGroupId(groupId: number): Tier {
  const tier = TIERS.find((t) => t.groupId === groupId);
  return tier?.tier ?? "p1";
}

export function useProductionChain(typeId: number | null) {
  const [tree, setTree] = useState<ProductionNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildTree = useCallback(
    async (id: number, quantity: number): Promise<ProductionNode> => {
      const typeData = await fetchType(id);
      const tier = getTierByGroupId(typeData.group_id);
      const node: ProductionNode = {
        typeId: id,
        name: typeData.name.en,
        tier,
        quantity,
        inputs: [],
      };

      const schematicIds = typeData.produced_by_schematic_ids;
      if (schematicIds && schematicIds.length > 0) {
        const schematic = await fetchSchematic(schematicIds[0]);
        node.schematicId = schematic.schematic_id;

        const inputPromises = Object.values(schematic.materials).map(
          (material) => buildTree(material.type_id, material.quantity * quantity)
        );
        node.inputs = await Promise.all(inputPromises);
      }

      return node;
    },
    []
  );

  useEffect(() => {
    if (typeId === null) {
      setTree(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    buildTree(typeId, 1)
      .then((result) => {
        if (!cancelled) {
          setTree(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [typeId, buildTree]);

  return { tree, loading, error };
}
