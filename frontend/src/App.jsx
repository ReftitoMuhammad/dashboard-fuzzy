import React, { useState } from 'react';
import Sidebar from './components/sidebar';
import Dashboard from './pages/dashboard';
import History from './pages/history';
import { AlertTriangle } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={page} setPage={setPage} />
      <div className="flex-1">
        {renderPage()}
      </div>
    </div>
  );
}
