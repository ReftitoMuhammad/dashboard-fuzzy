import React, { useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { useSensorData } from './hooks/sensordata';

// --- SVG Icons (Sama seperti sebelumnya) ---
const ThermometerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-500">
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
  </svg>
);
const GaugeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-orange-500">
    <path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </svg>
);
const TireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-gray-600">
        <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line>
    </svg>
);

// --- Komponen Utama Dashboard ---
export default function App() {
  // Gunakan custom hook kita untuk mendapatkan semua data real-time
  const { latestData, historicalData, prediction, isLoading } = useSensorData();

  // State untuk form simulasi tetap dikelola secara lokal
  const [simInputs, setSimInputs] = useState({ pressure: 110, temp: 75, thickness: 'Sedang' });
  const [simResult, setSimResult] = useState(null);

  // Fungsi untuk form simulasi
  const handleSimInputChange = (e) => {
    const { name, value } = e.target;
    setSimInputs(prev => ({ ...prev, [name]: name === 'thickness' ? value : Number(value) }));
  };

  const handleSimSubmit = (e) => {
    e.preventDefault();
    if (simInputs.pressure > 140 || simInputs.temp > 90 || simInputs.thickness === 'Tipis') {
      setSimResult({ status: 'Bahaya', color: 'red' });
    } else if (simInputs.pressure > 130 || simInputs.temp > 85) {
      setSimResult({ status: 'Perlu Pengecekan', color: 'yellow' });
    } else {
      setSimResult({ status: 'Aman', color: 'green' });
    }
  };

  // Helper untuk styling kartu status
  const getStatusColorClasses = (color) => {
    const colorMap = {
      gray: 'bg-gray-100 border-gray-400 text-gray-700',
      green: 'bg-green-100 border-green-500 text-green-800',
      yellow: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      red: 'bg-red-100 border-red-500 text-red-800',
    };
    return colorMap[color] || colorMap.gray;
  };

  // Siapkan data untuk ditampilkan di KPI cards
  const lastInputs = {
    pressure: latestData?.tekanan || 0,
    temp: latestData?.suhu || 0,
    thickness: latestData?.ketebalan || '...',
  };
  
  // Tampilkan UI loading jika data awal belum siap
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-xl font-semibold text-gray-600">
        Memuat Data Dashboard...
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Prediksi Kondisi Ban</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Kartu Status Utama (KPI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-6 rounded-lg shadow-lg border-l-4 ${getStatusColorClasses(prediction.color)}`}>
            <h2 className="text-sm font-medium uppercase tracking-wider">Hasil Prediksi Terakhir</h2>
            <p className="text-3xl font-extrabold mt-2">{prediction.status}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <GaugeIcon />
            <div><h2 className="text-sm font-medium text-gray-500">Tekanan Terakhir</h2><p className="text-2xl font-bold">{lastInputs.pressure} psi</p></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <ThermometerIcon />
            <div><h2 className="text-sm font-medium text-gray-500">Suhu Terakhir</h2><p className="text-2xl font-bold">{lastInputs.temp}°C</p></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <TireIcon />
            <div><h2 className="text-sm font-medium text-gray-500">Ketebalan Ban</h2><p className="text-2xl font-bold">{lastInputs.thickness}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Grafik Real-time */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-4">Tren Historis Tekanan & Suhu</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.8)", border: "1px solid #ccc", backdropFilter: "blur(5px)" }} />
                    <Legend iconSize={10} />
                    <Bar dataKey="tekanan" fill="#ef4444" name="Tekanan (psi)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="suhu" fill="#3b82f6" name="Suhu (°C)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Tabel Data Real-time */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg">Data Mentah Terakhir</h3>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tekanan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suhu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ketebalan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historicalData?.map((row) => (
                      <tr key={row.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.tekanan} psi</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.suhu}°C</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.ketebalan}</td>
                      </tr>
                    )).reverse()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Form Simulasi */}
          <div className="bg-white p-6 rounded-lg shadow-md h-fit">
            <h3 className="font-bold text-lg">Simulasi Prediksi "What-If"</h3>
            <form onSubmit={handleSimSubmit} className="mt-4 space-y-4">
              <div><label htmlFor="pressure" className="block text-sm font-medium text-gray-700">Tekanan (psi)</label><input type="number" name="pressure" id="pressure" value={simInputs.pressure} onChange={handleSimInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/></div>
              <div><label htmlFor="temp" className="block text-sm font-medium text-gray-700">Suhu (°C)</label><input type="number" name="temp" id="temp" value={simInputs.temp} onChange={handleSimInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/></div>
              <div><label htmlFor="thickness" className="block text-sm font-medium text-gray-700">Ketebalan Ban</label><select name="thickness" id="thickness" value={simInputs.thickness} onChange={handleSimInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"><option>Tebal</option><option>Sedang</option><option>Tipis</option></select></div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Jalankan Prediksi
              </button>
            </form>
            {simResult && (<div className={`mt-4 p-4 rounded-lg border-l-4 ${getStatusColorClasses(simResult.color)}`}><h4 className="font-bold">Hasil Simulasi:</h4><p className="text-xl font-bold">{simResult.status}</p></div>)}
          </div>
        </div>
      </main>
    </div>
  );
}

