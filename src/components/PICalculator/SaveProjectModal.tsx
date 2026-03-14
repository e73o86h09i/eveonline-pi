import { type FC, useState } from 'react';
import { TextInput } from 'flowbite-react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import type { Project } from '../../types';

type SaveProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  projects: Project[];
  defaultName?: string;
};

const SaveProjectModal: FC<SaveProjectModalProps> = ({ open, onClose, onSave, projects, defaultName = '' }) => {
  const [projectName, setProjectName] = useState(defaultName);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);

  if (open && !wasOpen) {
    setProjectName(defaultName);
    setConfirmOverwrite(false);
    setWasOpen(true);
  }

  if (!open && wasOpen) {
    setWasOpen(false);
  }

  const trimmedName = projectName.trim();
  const existingProject = projects.find((proj) => proj.name === trimmedName);

  const handleSave = () => {
    if (!trimmedName) {
      return;
    }

    if (existingProject && trimmedName !== defaultName) {
      setConfirmOverwrite(true);

      return;
    }

    onSave(trimmedName);
    onClose();
  };

  const handleConfirmOverwrite = () => {
    onSave(trimmedName);
    setConfirmOverwrite(false);
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Save Project" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="project-name" className="mb-2 block text-sm font-medium text-gray-300">
              Project name
            </label>
            <TextInput
              id="project-name"
              placeholder="My PI Setup"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSave}
              disabled={!trimmedName}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
      <ConfirmModal
        open={confirmOverwrite}
        onClose={() => setConfirmOverwrite(false)}
        onConfirm={handleConfirmOverwrite}
        title="Overwrite Project"
        message={`A project named "${trimmedName}" already exists. Do you want to overwrite it?`}
        confirmLabel="Overwrite"
        confirmColor="red"
      />
    </>
  );
};

export { SaveProjectModal };
