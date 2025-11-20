interface Props {
  image: string
  name: string
  subtitle: string
  onclick?: () => void
}

export default function ClassCard(props: Props) {
  return (
    <div
      className="flex flex-col min-h-[240px] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-blue-500 dark:hover:border-blue-400 active:translate-y-0"
      onClick={props.onclick}
    >
      <img
        src={props.image}
        alt={props.name}
        className="w-full h-36 object-cover bg-gradient-to-br from-blue-500 to-green-500"
      />
      <div className="flex-1 flex flex-col p-5 bg-white dark:bg-gray-800">
        <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-2 leading-tight">
          {props.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed m-0">
          {props.subtitle}
        </p>
      </div>
    </div>
  )
}