import { type FC, useState } from 'react';
import { LuFolderOpen, LuTrash2 } from 'react-icons/lu';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { type Project, TRADE_STATIONS } from '../../types';

type LoadProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onLoad: (project: Project) => void;
  onDelete: (name: string) => void;
  projects: Project[];
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStationName = (stationId: number): string => {
  const station = TRADE_STATIONS.find((station) => station.id === stationId);

  return station?.name.split(' - ')[0] ?? 'Unknown';
};

type ConfirmAction = {
  type: 'load' | 'delete';
  project: Project;
};

const LoadProjectModal: FC<LoadProjectModalProps> = ({ open, onClose, onLoad, onDelete, projects }) => {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const sortedProjects = [...projects].sort((a, b) => b.savedAt - a.savedAt);

  const handleConfirm = () => {
    if (!confirmAction) {
      return;
    }

    if (confirmAction.type === 'load') {
      onLoad(confirmAction.project);
      onClose();
    } else {
      onDelete(confirmAction.project.name);
    }

    setConfirmAction(null);
  };

  const handleClose = () => {
    setConfirmAction(null);
    onClose();
  };

  const confirmTitle = confirmAction?.type === 'load' ? 'Load Project' : 'Delete Project';
  const confirmMessage =
    confirmAction?.type === 'load'
      ? `Load "${confirmAction.project.name}"? This will replace your current selections.`
      : `Delete "${confirmAction?.project.name}"? This cannot be undone.`;
  const confirmLabel = confirmAction?.type === 'load' ? 'Load' : 'Delete';
  const confirmColor = confirmAction?.type === 'delete' ? 'red' : 'blue';

  return (
    <>
      <Modal open={open} onClose={handleClose} title="Load Project" maxWidth="max-w-md">
        {sortedProjects.length === 0 ? (
          <p className="text-sm text-gray-400">No saved projects yet.</p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {sortedProjects.map((project) => (
              <div key={project.name} className="flex items-center justify-between gap-3 rounded-lg border border-gray-600 bg-gray-700 p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-white">{project.name}</div>
                  <div className="text-xs text-gray-400">
                    {getStationName(project.stationId)} · {project.selections.length} item{project.selections.length !== 1 ? 's' : ''} ·{' '}
                    {formatDate(project.savedAt)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    className="rounded p-1.5 text-blue-400 hover:bg-gray-600 hover:text-blue-300"
                    onClick={() => setConfirmAction({ type: 'load', project })}
                    title="Load project"
                  >
                    <LuFolderOpen size={16} />
                  </button>
                  <button
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-600 hover:text-red-400"
                    onClick={() => setConfirmAction({ type: 'delete', project })}
                    title="Delete project"
                  >
                    <LuTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
      <ConfirmModal
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={confirmLabel}
        confirmColor={confirmColor as 'red' | 'blue'}
      />
    </>
  );
};

export { LoadProjectModal };
