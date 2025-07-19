import React from 'react';
import useSWR from 'swr';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Thermometer, GaugeCircle, AlertTriangle, CheckCircle, ShieldQuestion } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

// Helper untuk mendapatkan status yang paling dominan
const getDominantStatus = (data) => {
  if (!data || data.length === 0) {
    return { name: 'N/A', icon: <ShieldQuestion className="h-5 w-5 text-gray-400" /> };
  }
  const dominant = data.reduce((a, b) => (a.value > b.value ? a : b));
  switch (dominant.name) {
    case 'Baik': return { name: 'Baik', icon: <CheckCircle className="h-5 w-5 text-green-500" /> };
    case 'Sedang': return { name: 'Sedang', icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> };
    case 'Buruk': return { name: 'Buruk', icon: <AlertTriangle className="h-5 w-5 text-red-500" /> };
    default: return { name: 'N/A', icon: <ShieldQuestion className="h-5 w-5 text-gray-400" /> };
  }
};

export default function WeeklySummaryCard() {
  const { data, error, isLoading } = useSWR('http://localhost:3001/api/weekly-summary', fetcher, {
    refreshInterval: 60000 // Refresh data setiap 1 menit
  });

  if (isLoading) return <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">Memuat statistik...</div>;
  if (error) return <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center text-red-500">Gagal memuat</div>;

  const dominantStatus = getDominantStatus(data.statusDistribution);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <div className="flex items-center space-x-2 border-b pb-3 mb-3">
        <TrendingUp className="h-6 w-6 text-indigo-600" />
        <h3 className="font-bold text-lg">Ringkasan Statistik Mingguan</h3>
      </div>
      
      <div className="flex flex-col gap-4">
        {/* Kolom Kiri: Statistik Teks */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <GaugeCircle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Rata-rata Tekanan</p>
              <p className="font-bold text-lg">{data.avgTekanan} psi</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Rata-rata Suhu</p>
              <p className="font-bold text-lg">{data.avgSuhu}°C</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {dominantStatus.icon}
            <div>
              <p className="text-sm text-gray-500">Status Dominan</p>
              <p className="font-bold text-lg">{dominantStatus.name}</p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Grafik Lingkaran */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
              >
                {data.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
