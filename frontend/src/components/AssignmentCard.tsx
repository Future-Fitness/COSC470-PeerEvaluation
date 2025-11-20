interface Props {
  onClick?: () => void
  children?: React.ReactNode
  id: number | string
}

export default function AssignmentCard(props: Props) {
  return (
    <div
      onClick= {() => {
         window.location.href = `/assignments/${props.id}`
      }
    }
      className='flex flex-row justify-start items-center text-slate-900 dark:text-slate-100 p-3 w-full h-auto rounded-md font-bold text-base text-left cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700'
    >
      <img src="/icons/document.svg" alt="document" className="w-10 h-10 dark:invert" />

      {props.children}
    </div>
  )
}