import { Home, User, LogOut, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { logout } from '../util/login';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar() {
  const location = window.location.pathname;
  const { isDarkMode, toggleDarkMode, isSidebarCollapsed, toggleSidebar } = useTheme();

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm flex flex-col transition-all duration-300 z-50 ${
        isSidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo Section */}
      <div className="flex justify-center items-center mt-6 mb-4 px-2">
        <img
          src="/public/oc_logo.png"
          alt="OC Logo"
          className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-20 h-20'}`}
        />
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isSidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Navigation Links */}
      <nav className="flex flex-col flex-1 py-2 px-2">
        <SidebarRow
          selected={location === '/home'}
          href="/home"
          icon={<Home className="w-5 h-5" />}
          collapsed={isSidebarCollapsed}
        >
          Home
        </SidebarRow>

        <SidebarRow
          selected={location.includes('/profile')}
          href="/profile/1"
          icon={<User className="w-5 h-5" />}
          collapsed={isSidebarCollapsed}
        >
          My Info
        </SidebarRow>
      </nav>

      {/* Bottom Section - Dark Mode Toggle & Logout */}
      <div className="flex flex-col py-2 px-2 border-t border-gray-200 dark:border-gray-700">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`flex items-center gap-3 mx-1 my-1 py-3 px-3 rounded-lg transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-700 ${
            isSidebarCollapsed ? 'justify-center' : ''
          }`}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
          {!isSidebarCollapsed && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* Logout Button */}
        <SidebarRow
          selected={false}
          href="#"
          icon={<LogOut className="w-5 h-5" />}
          collapsed={isSidebarCollapsed}
          onclick={() => logout()}
        >
          Logout
        </SidebarRow>
      </div>
    </div>
  );
}

interface SidebarRowProps {
  selected: boolean;
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  collapsed: boolean;
  onclick?: () => void;
}

function SidebarRow({ selected, href, children, icon, collapsed, onclick }: SidebarRowProps) {
  return (
    <div
      className={`flex items-center mx-1 my-1 rounded-lg transition-all duration-150 ${
        selected
          ? 'bg-blue-50 dark:bg-blue-900/30'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onClick={onclick}
    >
      <a
        href={selected ? '#' : href}
        className={`flex items-center gap-3 w-full no-underline py-3 px-3 text-sm font-medium rounded-lg transition-all duration-150 ${
          collapsed ? 'justify-center' : ''
        } ${
          selected
            ? 'text-blue-600 dark:text-blue-400 font-semibold'
            : 'text-gray-700 dark:text-gray-200'
        }`}
        title={collapsed ? String(children) : undefined}
      >
        <span className={selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
          {icon}
        </span>
        {!collapsed && children}
      </a>
    </div>
  );
}
