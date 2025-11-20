import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react'; // For the close icon

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-85 transition-opacity duration-300"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 transform transition-all duration-300 scale-100 opacity-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close button */}
        <button
          type="button"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Title */}
        {title && (
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4" id="modal-title">
            {title}
          </h3>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
