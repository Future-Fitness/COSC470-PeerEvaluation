interface Props {
  onClick?: () => void
  children?: React.ReactNode
  type?: 'regular' | 'secondary'
  disabled?: boolean
}

export default function Button(props: Props) {
  const baseClasses = 'appearance-none border-none rounded p-3 font-bold text-base transition-all duration-150';

  const typeClasses = props.type === 'secondary'
    ? 'bg-slate-500 dark:bg-slate-600 text-white'
    : 'bg-primary-500 dark:bg-primary-600 text-white';

  const stateClasses = props.disabled
    ? 'bg-slate-400 dark:bg-slate-600 text-slate-600 dark:text-slate-400 cursor-not-allowed'
    : `${typeClasses} cursor-pointer hover:brightness-110`;

  return (
    <button
      className={`${baseClasses} ${stateClasses}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  )
}