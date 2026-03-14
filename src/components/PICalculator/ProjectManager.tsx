import { type FC, useState } from 'react';
import { LuFolderOpen, LuSave } from 'react-icons/lu';
import type { CommoditySelection, Project } from '../../types';
import { SaveProjectModal } from './SaveProjectModal';
import { LoadProjectModal } from './LoadProjectModal';

type ProjectManagerProps = {
  projects: Project[];
  onSave: (name: string) => void;
  onLoad: (project: Project) => void;
  onDelete: (name: string) => void;
  selections: CommoditySelection[];
  activeProjectName: string | null;
};

const ProjectManager: FC<ProjectManagerProps> = ({ projects, onSave, onLoad, onDelete, selections, activeProjectName }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);

  const hasActiveSelections = selections.some((sel) => sel.typeId !== null);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setShowLoadModal(true)}
          disabled={projects.length === 0}
          title={projects.length === 0 ? 'No saved projects' : 'Load project'}
        >
          <LuFolderOpen size={16} />
          <span>Load</span>
        </button>
        <button
          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setShowSaveModal(true)}
          disabled={!hasActiveSelections}
          title={hasActiveSelections ? 'Save current selections as a project' : 'Select at least one commodity to save'}
        >
          <LuSave size={16} />
          <span>Save</span>
        </button>
        {activeProjectName && <span className="text-sm text-gray-400">· {activeProjectName}</span>}
      </div>
      <SaveProjectModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={onSave}
        projects={projects}
        defaultName={activeProjectName ?? ''}
      />
      <LoadProjectModal open={showLoadModal} onClose={() => setShowLoadModal(false)} onLoad={onLoad} onDelete={onDelete} projects={projects} />
    </>
  );
};

export { ProjectManager };
