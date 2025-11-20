import React from 'react';

interface Props {
  onInput?: (value: string) => void;
  className?: string;
  placeholder?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  value?: string;
  rows?: number; // Optional prop for textarea rows
}

export default function Textarea(props: Props) {
  const baseClasses = 'appearance-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 p-3 rounded w-full placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-150 resize-y';

  return (
    <textarea
      rows={props.rows || 4} // Default rows to 4
      className={`${baseClasses} ${props.className || ''}`}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(e) => {
        if (!props?.onInput) {
          return;
        }
        props.onInput(e.target.value);
      }}
      onKeyPress={props.onKeyPress}
    />
  );
}
