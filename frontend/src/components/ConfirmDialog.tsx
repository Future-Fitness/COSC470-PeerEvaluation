import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import Button from './Button';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />,
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      buttonClass: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: <Check className="w-12 h-12 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className={`${style.bg} ${style.border} border rounded-lg p-6 mb-6`}>
            <div className="flex flex-col items-center text-center">
              {style.icon}
              <p className="mt-4 text-gray-900 dark:text-gray-100 text-lg">{message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {cancelText}
            </Button>
            <Button onClick={onConfirm} className={`flex-1 ${style.buttonClass}`}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
