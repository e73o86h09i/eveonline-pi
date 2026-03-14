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

  const deleteProjects = useCallback(
    (names: Set<string>) => {
      setProjects((prev) => prev.filter((proj) => !names.has(proj.name)));
    },
    [setProjects],
  );

  const importProjects = useCallback(
    (imported: Project[]) => {
      setProjects((prev) => {
        const existingNames = new Set(prev.map((proj) => proj.name));
        const newProjects: Project[] = [];

        for (const project of imported) {
          let uniqueName = project.name;
          let counter = 1;
          while (existingNames.has(uniqueName)) {
            uniqueName = `${project.name} (${counter})`;
            counter++;
          }

          existingNames.add(uniqueName);
          newProjects.push({ ...project, name: uniqueName });
        }

        return [...prev, ...newProjects];
      });
    },
    [setProjects],
  );

  return { projects, saveProject, deleteProject, deleteProjects, importProjects };
};

export { useProjects };
