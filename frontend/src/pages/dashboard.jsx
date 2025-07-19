import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useSensorData } from '../hooks/sensordata';
import { Thermometer, GaugeCircle, Disc, Info, AlertTriangle } from 'lucide-react';
import WeeklySummaryCard from '../components/weeklysummary';
import SimulationCard from '../components/simulation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const { latestData, historicalData, prediction, isLoading, error } = useSensorData();

  // --- PERBAIKAN: TANGANI KONDISI ERROR DAN LOADING DI AWAL ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertTriangle className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold">Gagal Terhubung ke Server</h2>
        <p className="text-red-400">Pastikan server backend dan service Python berjalan.</p>
        <p className="mt-2 text-sm text-gray-500">Error: {error.message}</p>
      </div>
    );
  }
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

  const lastInputs = {
    pressure: latestData?.tekanan || 0,
    temp: latestData?.suhu || 0,
    thickness: latestData?.ketebalan || '...',
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-xl font-semibold text-gray-600">
        Memuat Data Dashboard...
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="bg-white shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </header>

      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`p-6 rounded-lg shadow-lg border-l-4 relative ${getStatusColorClasses(prediction.color)}`}>
            {/* Tombol Info dengan Dialog */}
            {latestData?.reasons && latestData.reasons.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 transition-colors">
                    <Info className="h-5 w-5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Detail Analisis Prediksi</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <ul className="space-y-3">
                      {latestData.reasons.map((reason, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <h2 className="text-sm font-medium uppercase tracking-wider">Hasil Prediksi Terakhir</h2>
            <p className="text-3xl font-extrabold mt-2">{prediction.status}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <GaugeCircle className="h-8 w-8 text-orange-500" />
            <div><h2 className="text-sm font-medium text-gray-500">Tekanan Terakhir</h2><p className="text-2xl font-bold">{lastInputs.pressure} psi</p></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <Thermometer className="h-8 w-8 text-blue-500" />
            <div><h2 className="text-sm font-medium text-gray-500">Suhu Terakhir</h2><p className="text-2xl font-bold">{lastInputs.temp}°C</p></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <Disc className="h-8 w-8 text-gray-600" />
            <div><h2 className="text-sm font-medium text-gray-500">Ketebalan Ban</h2><p className="text-2xl font-bold">{lastInputs.thickness}</p></div>
          </div>
        </div>

        {/* ... (Sisa kode JSX untuk Grafik, Tabel, dan Form sama persis) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:items-start gap-6 mt-6">
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
          <div className="space-y-6 h-fit">
            <WeeklySummaryCard />
             <SimulationCard />
          </div>
        </div>
      </main>
    </div>
  );
}
