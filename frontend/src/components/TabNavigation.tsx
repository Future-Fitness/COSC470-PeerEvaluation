import { ReactNode } from 'react'; // Import ReactNode

interface Props {
  tabs: {
    label: string,
    path: string,
    icon?: ReactNode, // Add optional icon prop
  }[]
}

export default function TabNavigation(props: Props) {
  return (
    <div className="flex flex-wrap justify-start items-center w-full px-4 border-b border-gray-200 dark:border-gray-700">
      {
        props.tabs.map(tab => {
          const isActive = tab.path === window.location.pathname;
          const classes = `flex items-center gap-2 py-3 px-4 transition-colors duration-150 ${
            isActive
              ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-b-2 border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`;
          return (
            <div
              key={tab.path}
              className={classes}
              onClick={() => window.location.href = tab.path}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span className="text-sm">{tab.label}</span>
            </div>
          )
        })
      }
    </div>
  )
}