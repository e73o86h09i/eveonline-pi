import type { FC, ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
};

const Modal: FC<ModalProps> = ({ open, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className={`mx-4 w-full ${maxWidth} rounded-lg border border-gray-600 bg-gray-800 shadow-xl`} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-600 p-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-700 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export { Modal };
