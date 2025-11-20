import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ fullScreen = false }) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-opacity-75 z-50'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-primary-500 border-opacity-25 border-t-primary-500 dark:border-primary-400 dark:border-opacity-25 dark:border-t-primary-400"></div>
    </div>
  );
};

export default Loader;
