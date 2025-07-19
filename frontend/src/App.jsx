import React, { useState, useEffect } from 'react';
import Sidebar from './components/sidebar';
import Dashboard from './pages/dashboard';
import History from './pages/history';
import Settings from './pages/settings'
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [isSidebarExpanded, setSidebarExpanded] = useState(false);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  useEffect(() => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.add(savedTheme);
}, []);


  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Sidebar
        currentPage={page}
        setPage={setPage}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setSidebarExpanded}
      />
      <div className="flex-1 ml-20">
        {renderPage()}
      </div>
    </div>
  );
}
