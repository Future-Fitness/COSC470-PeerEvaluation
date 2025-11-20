interface Props {
  onClick?: () => void
  children?: React.ReactNode
  type?: 'regular' | 'secondary'
  disabled?: boolean
  className?: string
}

export default function Button(props: Props) {
  const baseClasses = 'appearance-none border-none rounded p-3 font-bold text-base transition-all duration-150 flex items-center justify-center gap-2';

  const typeClasses = props.type === 'secondary'
    ? 'bg-slate-500 dark:bg-slate-600 text-white'
    : 'bg-primary-500 dark:bg-primary-600 text-white';

  const stateClasses = props.disabled
    ? 'bg-slate-400 dark:bg-slate-600 text-slate-600 dark:text-slate-400 cursor-not-allowed'
    : props.type === 'secondary'
      ? 'bg-slate-500 dark:bg-slate-600 text-white hover:bg-slate-600 dark:hover:bg-slate-700 cursor-pointer'
      : 'bg-primary-500 dark:bg-primary-600 text-white hover:bg-primary-600 dark:hover:bg-primary-700 cursor-pointer';

  return (
    <button
      className={`${baseClasses} ${stateClasses} ${props.className || ''}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  )
}