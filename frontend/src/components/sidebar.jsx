import React from 'react';
import { LayoutDashboard, History, Settings, Car } from 'lucide-react';

export default function Sidebar({ currentPage, setPage, isExpanded, setIsExpanded }) {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Riwayat Data', icon: History },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-lg flex flex-col z-10
                 transition-all duration-300 ease-in-out ${
                   isExpanded ? 'w-64' : 'w-20'
                 }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="p-4 flex items-center border-b dark:border-gray-700 h-[65px]">
        <Car className="h-8 w-8 text-red-700 flex-shrink-0" />
        <span
          className={`overflow-hidden transition-all duration-200 ${
            isExpanded ? 'w-40 ml-3' : 'w-0'
          }`}
        >
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
            EWS FUZZY
          </h1>
        </span>
      </div>

      <nav className="p-4 flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 mb-2 ${
                  isExpanded ? '' : 'justify-center'
                } ${
                  currentPage === item.id
                    ? 'bg-red-100 text-red-700 font-semibold dark:bg-red-900/50 dark:text-red-700'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={`overflow-hidden transition-all duration-200 ${
                    isExpanded ? 'w-40 ml-3' : 'w-0'
                  }`}
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
