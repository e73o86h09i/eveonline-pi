import { type FC, useState } from 'react';
import { LuFolderKanban, LuSave } from 'react-icons/lu';
import type { Project } from '../../types';
import { SaveProjectModal } from './SaveProjectModal';
import { ProjectsModal } from './ProjectsModal';

type ProjectManagerProps = {
  projects: Project[];
  onSave: (name: string) => void;
  onLoad: (project: Project) => void;
  onDelete: (name: string) => void;
  onDeleteMany: (names: Set<string>) => void;
  onImport: (imported: Project[]) => void;
  activeProjectName: string | null;
};

const ProjectManager: FC<ProjectManagerProps> = ({ projects, onSave, onLoad, onDelete, onDeleteMany, onImport, activeProjectName }) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          onClick={() => setShowProjectsModal(true)}
          title="Manage projects"
        >
          <LuFolderKanban size={16} />
          <span>Projects</span>
        </button>
        <button
          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
          onClick={() => setShowSaveModal(true)}
          title="Save current selections as a project"
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
      <ProjectsModal
        open={showProjectsModal}
        onClose={() => setShowProjectsModal(false)}
        onLoad={onLoad}
        onDelete={onDelete}
        onDeleteMany={onDeleteMany}
        onImport={onImport}
        projects={projects}
      />
    </>
  );
};

export { ProjectManager };
