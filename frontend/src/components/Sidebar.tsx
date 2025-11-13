import { logout } from '../util/login'

export default function Sidebar() {
  // Check which page we are on
  const location = window.location.pathname

  return (
    <div className="w-60 min-w-60 h-screen bg-white border-r border-gray-200 shadow-sm flex flex-col">
      <div className="w-full h-25 flex justify-center items-center mt-6 mb-4">
        <img src="/public/oc_logo.png" alt="OC Logo" className="w-24 h-24" />
      </div>

      <div className="flex flex-col w-full h-full py-2">
        <SidebarRow selected={location === '/home'} href="/home">
          Home
        </SidebarRow>

        { /* TODO: make this ID match who is logged in */ }
        <SidebarRow selected={location.includes('/profile')} href="/profile/1">
          My Info
        </SidebarRow>
      </div>

      <div className="flex flex-col justify-end w-full h-full py-2">
        <SidebarRow
          onclick={() => logout()}
          href='#'
          selected={false}
        >
          Logout
        </SidebarRow>
      </div>
    </div>
  )
}

interface SidebarRowProps {
  selected: boolean
  href: string
  children: React.ReactNode
  onclick?: () => void
}

function SidebarRow(props: SidebarRowProps) {
  return (
    <div
      className={`flex flex-col mx-3 my-1 rounded-lg transition-all duration-150 ${
        props.selected ? 'bg-blue-50' : 'hover:bg-gray-100'
      }`}
      onClick={props.onclick}
    >
      <a
        href={props.selected ? '#' : props.href}
        className={`no-underline text-center py-3 px-4 text-base font-medium rounded-lg transition-all duration-150 ${
          props.selected ? 'text-blue-600 font-semibold' : 'text-gray-800'
        }`}
      >
        {props.children}
      </a>
    </div>
  )
}