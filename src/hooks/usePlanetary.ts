import { useEffect, useRef, useState } from 'react';
import type { CommodityType } from '../types';
import { fetchAllCommodities } from '../api';

export const useCommodities = () => {
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
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { commodities, loading, error };
};

import type { CommoditySelection, ProductionNode, Tier } from '../types';
import { fetchSchematic, fetchType } from '../api';
import { TIERS } from '../types';

const getTierByGroupId = (groupId: number): Tier => {
  const found = TIERS.find((tierInfo) => tierInfo.groupIds.includes(groupId));

  return found?.tier ?? 'r0';
};

const buildTree = async (id: number, quantity: number): Promise<ProductionNode> => {
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
    node.cycleTime = schematic.cycle_time;

    const output = Object.values(schematic.products)[0];
    const outputPerRun = output?.quantity ?? 1;
    node.outputPerRun = outputPerRun;
    const runs = Math.ceil(quantity / outputPerRun);
    node.quantity = runs * outputPerRun;

    const inputPromises = Object.values(schematic.materials).map((material) => buildTree(material.type_id, material.quantity * runs));
    node.inputs = await Promise.all(inputPromises);
  }

  return node;
};

export const useProductionChain = (typeId: number | null, quantity = 1) => {
  const [tree, setTree] = useState<ProductionNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const requestRef = useRef(0);
  const requestKey = typeId !== null ? `${typeId}-${quantity}` : null;

  useEffect(() => {
    if (typeId === null) {
      return;
    }

    const requestId = ++requestRef.current;

    buildTree(typeId, quantity)
      .then((result) => {
        if (requestRef.current === requestId) {
          setTree(result);
          setError(null);
          setResolvedKey(`${typeId}-${quantity}`);
        }
      })
      .catch((err: unknown) => {
        if (requestRef.current === requestId) {
          setTree(null);
          setError(err instanceof Error ? err.message : 'Unknown error');
          setResolvedKey(`${typeId}-${quantity}`);
        }
      });
  }, [typeId, quantity]);

  if (typeId === null) {
    return { tree: null, loading: false, error: null };
  }

  const loading = resolvedKey !== requestKey;

  return {
    tree: loading ? null : tree,
    loading,
    error: loading ? null : error,
  };
};

export type ResolvedTree = {
  selectionId: number;
  tree: ProductionNode;
};

type ResultEntry = {
  tree: ProductionNode | null;
  error: string | null;
  resolvedKey: string;
};

export const useMultiProductionChain = (selections: CommoditySelection[]) => {
  const [resultMap, setResultMap] = useState<Map<number, ResultEntry>>(() => new Map());
  const requestCounterRef = useRef<Map<number, number>>(new Map());
  const resolvedKeysRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    const activeIds = new Set(selections.map((sel) => sel.id));

    // Purge refs for removed selections
    for (const id of [...resolvedKeysRef.current.keys()]) {
      if (!activeIds.has(id)) {
        resolvedKeysRef.current.delete(id);
        requestCounterRef.current.delete(id);
      }
    }

    // Build trees for valid, changed selections
    for (const sel of selections) {
      if (sel.typeId === null) {
        resolvedKeysRef.current.delete(sel.id);
        continue;
      }

      const expectedKey = `${sel.typeId}-${sel.quantity}`;
      if (resolvedKeysRef.current.get(sel.id) === expectedKey) {
        continue;
      }

      const counter = (requestCounterRef.current.get(sel.id) ?? 0) + 1;
      requestCounterRef.current.set(sel.id, counter);

      buildTree(sel.typeId, sel.quantity)
        .then((result) => {
          if (requestCounterRef.current.get(sel.id) !== counter) {
            return;
          }

          resolvedKeysRef.current.set(sel.id, expectedKey);
          setResultMap((prev) => new Map(prev).set(sel.id, { tree: result, error: null, resolvedKey: expectedKey }));
        })
        .catch((err: unknown) => {
          if (requestCounterRef.current.get(sel.id) !== counter) {
            return;
          }

          resolvedKeysRef.current.set(sel.id, expectedKey);
          setResultMap((prev) =>
            new Map(prev).set(sel.id, { tree: null, error: err instanceof Error ? err.message : 'Unknown error', resolvedKey: expectedKey }),
          );
        });
    }
  }, [selections]);

  // Only consider selections with a chosen commodity
  const validSelections = selections.filter((sel) => sel.typeId !== null);
  const loading =
    validSelections.length > 0 &&
    validSelections.some((sel) => {
      const expectedKey = `${sel.typeId}-${sel.quantity}`;
      const result = resultMap.get(sel.id);

      return !result || result.resolvedKey !== expectedKey;
    });

  const trees: ResolvedTree[] = [];
  const errors: string[] = [];
  for (const sel of validSelections) {
    const result = resultMap.get(sel.id);
    if (result?.tree) {
      trees.push({ selectionId: sel.id, tree: result.tree });
    }

    if (result?.error) {
      errors.push(result.error);
    }
  }

  return { trees, loading, errors };
};
