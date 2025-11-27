import React from 'react';
import { createRoot } from 'react-dom/client';
import ConfirmDialog from '../components/ConfirmDialog';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
      document.body.removeChild(container);
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    root.render(
      <ConfirmDialog
        title={options.title || 'Confirm Action'}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant || 'warning'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  });
};
