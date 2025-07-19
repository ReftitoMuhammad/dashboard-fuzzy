// src/hooks/useSensorData.js
import useSWR from 'swr';
import { useEffect, useMemo } from 'react';
import io from 'socket.io-client';

const backendUrl = 'http://localhost:3001';
const fetcher = (url) => fetch(url).then((res) => res.json());

// Inisialisasi socket di luar komponen agar hanya ada satu koneksi
const socket = io(backendUrl, {
  transports: ['websocket'] // Paksa koneksi via WebSocket, jangan fallback ke polling
});

export function useSensorData() {
  // SWR untuk fetching data awal
  const { data: historicalData, mutate: mutateHistorical } = useSWR(`${backendUrl}/api/historical`, fetcher);
  const { data: latestData, mutate: mutateLatest } = useSWR(`${backendUrl}/api/latest`, fetcher);

  useEffect(() => {
    // Listener untuk event 'newData' dari server
    socket.on('newData', (newEntry) => {
      console.log('Menerima data baru dari socket (real-time):', newEntry);
      
      // --- OPTIMASI 1: Update data 'latest' secara instan ---
      // Parameter 'false' mencegah SWR melakukan fetch ulang yang tidak perlu.
      mutateLatest(newEntry, false);

      // --- OPTIMASI 2: Update data 'historical' secara instan ---
      mutateHistorical((currentData = []) => {
        const updatedData = [...currentData, newEntry];
        // Jaga agar array tidak terlalu panjang
        return updatedData.length > 5 ? updatedData.slice(1) : updatedData;
      }, false); // Parameter 'false' ini juga sangat penting.
    });

    // Cleanup listener saat komponen tidak lagi digunakan
    return () => {
      socket.off('newData');
      socket.off('connect_error');
    };
  }, [mutateHistorical, mutateLatest]);

  // Logika untuk menampilkan status loading
  const isLoading = !historicalData && !latestData;

  // Logika untuk menghitung prediksi (dijalankan setiap kali latestData berubah)
  const prediction = useMemo(() => {
    if (!latestData) return { status: 'Memuat...', color: 'gray' };
    if (latestData.tekanan > 140 || latestData.suhu > 90 || latestData.status === 'Buruk') {
      return { status: 'Bahaya', color: 'red' };
    }
    if (latestData.tekanan > 130 || latestData.suhu > 85 || latestData.status === 'Sedang') {
      return { status: 'Perlu Pengecekan', color: 'yellow' };
    }
    return { status: 'Aman', color: 'green' };
  }, [latestData]);

  return {
    latestData,
    historicalData,
    prediction,
    isLoading,
  };
}
