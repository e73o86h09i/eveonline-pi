import { type ChangeEvent, type FC, useRef, useState } from 'react';
import { LuDownload, LuFolderOpen, LuTrash2, LuUpload } from 'react-icons/lu';
import { type Project, TRADE_STATIONS } from '../../types';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';

type ProjectsModalProps = {
  open: boolean;
  onClose: () => void;
  onLoad: (project: Project) => void;
  onDelete: (name: string) => void;
  onDeleteMany: (names: Set<string>) => void;
  onImport: (imported: Project[]) => void;
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
  const station = TRADE_STATIONS.find((tradeStation) => tradeStation.id === stationId);

  return station?.name.split(' - ')[0] ?? 'Unknown';
};

const exportProjects = (projectsToExport: Project[]) => {
  const json = JSON.stringify(projectsToExport, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = projectsToExport.length === 1 ? `${projectsToExport[0].name}.json` : 'eve-pi-projects.json';
  anchor.click();
  URL.revokeObjectURL(url);
};

const validateProjects = (data: unknown): Project[] | null => {
  const items = Array.isArray(data) ? data : [data];

  for (const item of items) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.name !== 'string' ||
      typeof item.stationId !== 'number' ||
      !Array.isArray(item.selections) ||
      typeof item.savedAt !== 'number'
    ) {
      return null;
    }
  }

  return items as Project[];
};

type ConfirmAction = { type: 'load'; project: Project } | { type: 'delete'; project: Project } | { type: 'delete-many'; names: Set<string> };

const ProjectsModal: FC<ProjectsModalProps> = ({ open, onClose, onLoad, onDelete, onDeleteMany, onImport, projects }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setSelected(new Set());
    setConfirmAction(null);
    setImportError(null);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  const sortedProjects = [...projects].sort((a, b) => b.savedAt - a.savedAt);
  const allSelected = sortedProjects.length > 0 && selected.size === sortedProjects.length;
  const someSelected = selected.size > 0;

  const handleToggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }

      return next;
    });
  };

  const handleToggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sortedProjects.map((project) => project.name)));
    }
  };

  const handleConfirm = () => {
    if (!confirmAction) {
      return;
    }

    if (confirmAction.type === 'load') {
      onLoad(confirmAction.project);
      onClose();
    } else if (confirmAction.type === 'delete') {
      onDelete(confirmAction.project.name);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(confirmAction.project.name);

        return next;
      });
    } else if (confirmAction.type === 'delete-many') {
      onDeleteMany(confirmAction.names);
      setSelected(new Set());
    }

    setConfirmAction(null);
  };

  const handleExportSelected = () => {
    const projectsToExport = sortedProjects.filter((project) => selected.has(project.name));
    if (projectsToExport.length > 0) {
      exportProjects(projectsToExport);
    }
  };

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data: unknown = JSON.parse(reader.result as string);
        const validated = validateProjects(data);
        if (!validated) {
          setImportError('Invalid project file format.');

          return;
        }

        onImport(validated);
      } catch {
        setImportError('Failed to parse JSON file.');
      }
    };

    reader.readAsText(file);

    // Reset file input so the same file can be re-imported
    event.target.value = '';
  };

  const handleClose = () => {
    setConfirmAction(null);
    onClose();
  };

  const confirmTitle = confirmAction?.type === 'load' ? 'Load Project' : confirmAction?.type === 'delete' ? 'Delete Project' : 'Delete Projects';
  const confirmMessage =
    confirmAction?.type === 'load'
      ? `Load "${confirmAction.project.name}"? This will replace your current selections.`
      : confirmAction?.type === 'delete'
        ? `Delete "${confirmAction.project.name}"? This cannot be undone.`
        : `Delete ${confirmAction?.names.size} selected project${confirmAction?.names.size !== 1 ? 's' : ''}? This cannot be undone.`;
  const confirmLabel = confirmAction?.type === 'load' ? 'Load' : 'Delete';
  const confirmColor: 'red' | 'blue' = confirmAction?.type === 'load' ? 'blue' : 'red';

  return (
    <>
      <Modal open={open} onClose={handleClose} title="Projects" maxWidth="max-w-lg">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 rounded-lg border border-gray-600 bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <LuUpload size={14} />
              <span>Import</span>
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
            {someSelected && (
              <>
                <button
                  className="flex items-center gap-1.5 rounded-lg border border-gray-600 bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
                  onClick={handleExportSelected}
                >
                  <LuDownload size={14} />
                  <span>Export ({selected.size})</span>
                </button>
                <button
                  className="flex items-center gap-1.5 rounded-lg border border-red-800 bg-red-900/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/50 hover:text-red-300"
                  onClick={() => setConfirmAction({ type: 'delete-many', names: new Set(selected) })}
                >
                  <LuTrash2 size={14} />
                  <span>Delete ({selected.size})</span>
                </button>
              </>
            )}
          </div>
        </div>

        {importError && <p className="mb-3 text-sm text-red-400">{importError}</p>}

        {sortedProjects.length === 0 ? (
          <p className="text-sm text-gray-400">No projects yet. Import a project or save one from the calculator.</p>
        ) : (
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                className="rounded border-gray-500 bg-gray-700 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-800"
              />
              Select all
            </label>
            {sortedProjects.map((project) => (
              <div key={project.name} className="flex items-center gap-3 rounded-lg border border-gray-600 bg-gray-700 p-3">
                <input
                  type="checkbox"
                  checked={selected.has(project.name)}
                  onChange={() => handleToggle(project.name)}
                  className="shrink-0 rounded border-gray-500 bg-gray-700 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-800"
                />
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
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-600 hover:text-gray-200"
                    onClick={() => exportProjects([project])}
                    title="Export project"
                  >
                    <LuDownload size={16} />
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
        confirmColor={confirmColor}
      />
    </>
  );
};

export { ProjectsModal };
