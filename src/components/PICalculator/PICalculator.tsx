import { type FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { type CommoditySelection, type Project, TIERS, TRADE_STATIONS } from '../../types';
import { useCommodities, useLocalStorage, useMargins, usePrices, useProjects } from '../../hooks';
import { StationSelector } from '../StationSelector';
import { CommoditySelector } from '../CommoditySelector';
import { ProductionChain } from '../ProductionChain';
import { PICalculatorProvider } from './PICalculatorProvider';
import { ProjectManager } from './ProjectManager';

const DEFAULT_SELECTIONS: CommoditySelection[] = [{ id: 1, typeId: null, quantity: 1 }];

const R0_GROUP_IDS = new Set(TIERS.find((tier) => tier.tier === 'r0')?.groupIds ?? []);

const PICalculator: FC = () => {
  const { commodities, loading, error } = useCommodities();
  const [stationId, setStationId] = useLocalStorage('stationId', TRADE_STATIONS[0].id);
  const selectableCommodities = useMemo(() => commodities.filter((commodity) => !R0_GROUP_IDS.has(commodity.group_id)), [commodities]);
  const { prices, loading: pricesLoading } = usePrices(commodities, stationId);
  const margins = useMargins(selectableCommodities, prices);
  const [selections, setSelections] = useLocalStorage<CommoditySelection[]>('selections', DEFAULT_SELECTIONS);
  const nextIdRef = useRef(Math.max(...selections.map((sel) => sel.id), 0) + 1);

  const { projects, saveProject, deleteProject } = useProjects();
  const [activeProjectName, setActiveProjectName] = useLocalStorage<string | null>('activeProject', null);

  useEffect(() => {
    if (activeProjectName) {
      saveProject(activeProjectName, stationId, selections);
    }
  }, [activeProjectName, stationId, selections, saveProject]);

  const handleSelectCommodity = useCallback(
    (selectionId: number, typeId: number | null) => {
      setSelections((prev) => prev.map((sel) => (sel.id === selectionId ? { ...sel, typeId } : sel)));
    },
    [setSelections],
  );

  const handleQuantityChange = useCallback(
    (selectionId: number, quantity: number) => {
      setSelections((prev) => prev.map((sel) => (sel.id === selectionId ? { ...sel, quantity } : sel)));
    },
    [setSelections],
  );

  const handleAddSelection = useCallback(() => {
    setSelections((prev) => [...prev, { id: nextIdRef.current++, typeId: null, quantity: 1 }]);
  }, [setSelections]);

  const handleRemoveSelection = useCallback(
    (selectionId: number) => {
      setSelections((prev) => prev.filter((sel) => sel.id !== selectionId));
    },
    [setSelections],
  );

  const handleSaveProject = useCallback(
    (name: string) => {
      saveProject(name, stationId, selections);
      setActiveProjectName(name);
    },
    [saveProject, stationId, selections, setActiveProjectName],
  );

  const handleLoadProject = useCallback(
    (project: Project) => {
      setStationId(project.stationId);
      const restoredSelections = project.selections.map((sel, index) => ({
        ...sel,
        id: index + 1,
      }));
      setSelections(restoredSelections);
      nextIdRef.current = restoredSelections.length + 1;
      setActiveProjectName(project.name);
    },
    [setStationId, setSelections, setActiveProjectName],
  );

  const handleDeleteProject = useCallback(
    (name: string) => {
      deleteProject(name);
      if (activeProjectName === name) {
        setActiveProjectName(null);
      }
    },
    [deleteProject, activeProjectName, setActiveProjectName],
  );

  return (
    <PICalculatorProvider prices={prices} pricesLoading={pricesLoading} margins={margins}>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Planetary Interaction Calculator</h1>
          <StationSelector stationId={stationId} onStationChange={setStationId} />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <ProjectManager
            projects={projects}
            onSave={handleSaveProject}
            onLoad={handleLoadProject}
            onDelete={handleDeleteProject}
            selections={selections}
            activeProjectName={activeProjectName}
          />
        </div>

        {error && <p className="mb-4 text-red-400">Failed to load commodities: {error}</p>}

        <CommoditySelector
          commodities={selectableCommodities}
          loading={loading}
          selections={selections}
          onSelectCommodity={handleSelectCommodity}
          onQuantityChange={handleQuantityChange}
          onAddSelection={handleAddSelection}
          onRemoveSelection={handleRemoveSelection}
        />

        <ProductionChain selections={selections} />
      </main>
    </PICalculatorProvider>
  );
};

export { PICalculator };
