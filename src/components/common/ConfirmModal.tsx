import type { FC } from 'react';
import { Modal } from './Modal';

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: 'red' | 'blue';
};

const ConfirmModal: FC<ConfirmModalProps> = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmColor = 'blue' }) => {
  const colorClasses = confirmColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="mb-4 text-sm text-gray-300">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white" onClick={onClose}>
          Cancel
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm text-white ${colorClasses}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export { ConfirmModal };
