import useSWR from 'swr';
import { useEffect, useMemo } from 'react';
import io from 'socket.io-client';

const backendUrl = 'http://localhost:3001';
const fetcher = (url) => fetch(url).then((res) => res.json());
const socket = io(backendUrl);

export function useSensorData() {
  const { data: historicalData, mutate: mutateHistorical } = useSWR(`${backendUrl}/api/historical`, fetcher);
  const { data: latestData, mutate: mutateLatest } = useSWR(`${backendUrl}/api/latest`, fetcher);

  useEffect(() => {
    socket.on('newData', (newEntry) => {
      console.log('Menerima data baru dari socket:', newEntry);
      
      mutateLatest(newEntry, false);

      mutateHistorical((currentData = []) => {
        const updatedData = [...currentData, newEntry];
        return updatedData.length > 5 ? updatedData.slice(1) : updatedData;
      }, false);
    });

    return () => {
      socket.off('newData');
    };
  }, [mutateHistorical, mutateLatest]);

  const isLoading = !historicalData && !latestData;

  const prediction = useMemo(() => {
    if (!latestData) return { status: 'Memuat...', color: 'gray' };
    if (latestData.tekanan > 140 || latestData.suhu > 90 || latestData.ketebalan === 'Tipis') {
      return { status: 'Bahaya', color: 'red' };
    }
    if (latestData.tekanan > 130 || latestData.suhu > 85) {
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
