import React, { useState } from 'react';
import Sidebar from './components/sidebar';
import Dashboard from './pages/dashboard';
import History from './pages/history';

export default function App() {
  // State untuk mengontrol halaman mana yang sedang aktif
  const [page, setPage] = useState('dashboard');

  // Fungsi untuk merender halaman berdasarkan state 'page'
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
      {/* Sidebar untuk navigasi */}
      <Sidebar currentPage={page} setPage={setPage} />

      {/* Konten utama yang berubah sesuai halaman */}
      <div className="flex-1">
        {renderPage()}
      </div>
    </div>
  );
}
