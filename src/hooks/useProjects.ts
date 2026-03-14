import { useCallback } from 'react';
import type { CommoditySelection, Project } from '../types';
import { useLocalStorage } from './useLocalStorage';

const useProjects = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>('projects', []);

  const saveProject = useCallback(
    (name: string, stationId: number, selections: CommoditySelection[]) => {
      const activeSelections = selections.filter((sel) => sel.typeId !== null);
      if (activeSelections.length === 0) {
        return;
      }

      const project: Project = {
        name,
        stationId,
        selections: activeSelections,
        savedAt: Date.now(),
      };

      setProjects((prev) => {
        const existingIndex = prev.findIndex((proj) => proj.name === name);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = project;

          return updated;
        }

        return [...prev, project];
      });
    },
    [setProjects],
  );

  const deleteProject = useCallback(
    (name: string) => {
      setProjects((prev) => prev.filter((proj) => proj.name !== name));
    },
    [setProjects],
  );

  return { projects, saveProject, deleteProject };
};

export { useProjects };
