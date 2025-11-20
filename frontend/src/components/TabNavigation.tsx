interface Props {
  tabs: {
    label: string,
    path: string,
  }[]
}

export default function TabNavigation(props: Props) {
  return (
    <div className="flex flex-row justify-start items-center w-full p-3 border-b border-gray-200 dark:border-gray-700">
      {
        props.tabs.map(tab => {
          const isActive = tab.path === window.location.pathname;
          const classes = `flex flex-row justify-center items-center py-5 px-1.5 mx-5 border-b-2 cursor-pointer transition-colors duration-150 ${
            isActive
              ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`;
          return (
            <div
              key={tab.path}
              className={classes}
              onClick={() => window.location.href = tab.path}
            >
              {tab.label}
            </div>
          )
        })
      }
    </div>
  )
}