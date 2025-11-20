interface Props {
  onInput?: (value: string) => void
  className?: string
  placeholder?: string
  type?: string
  onKeyPress?: (e: React.KeyboardEvent) => void
  value?: string
  disabled?: boolean
}

export default function Textbox(props: Props) {
  const baseClasses = 'appearance-none bg-slate-50 dark:bg-gray-700 text-slate-900 dark:text-slate-100 border border-gray-300 dark:border-gray-600 p-3 rounded w-full placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-150';

  return (
    <input
      type={props.type || 'text'}
      className={`${baseClasses} ${props.className || ''}`}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(e) => {
        if (!props?.onInput) {
          return
        }
        props.onInput(e.target.value)
      }}
      onKeyPress={props.onKeyPress}
      disabled={props.disabled}
    />
  )
}