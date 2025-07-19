import React from 'react';
import { LayoutDashboard, History, Settings, Car } from 'lucide-react';

export default function Sidebar({ currentPage, setPage }) {
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Riwayat Data', icon: History },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0">
      <div className="p-6 flex items-center space-x-3 border-b">
        <Car className="h-8 w-8 text-indigo-600" />
        <h1 className="text-xl font-bold text-gray-800">TireMonitor</h1>
      </div>
      <nav className="p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setPage(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'bg-indigo-100 text-indigo-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
