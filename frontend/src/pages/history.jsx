import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const fetcher = (url) => fetch(url).then((res) => res.json());

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function History() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const swrKey = `http://localhost:3001/api/sensor-data?page=${page}&limit=10&search=${debouncedSearchTerm}`;
  const { data, error, isLoading } = useSWR(swrKey, fetcher, { revalidateOnFocus: false });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  return (
    <div className="w-full">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Data Sensor</h1>
        </div>
      </header>
      <main className="w-full mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {/* Fitur Pencarian */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari berdasarkan status atau tekanan..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabel Data */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Tekanan (psi)</TableHead>
                  <TableHead>Suhu (°C)</TableHead>
                  <TableHead>Ketebalan (mm)</TableHead>
                  <TableHead>Status Prediksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-red-500">Gagal memuat data</TableCell></TableRow>
                ) : data?.data?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center">Tidak ada data ditemukan.</TableCell></TableRow>
                ) : (
                  data?.data?.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.id}</TableCell>
                      <TableCell>{new Date(row.timestamp).toLocaleString('id-ID')}</TableCell>
                      <TableCell>{row.tekanan}</TableCell>
                      <TableCell>{row.suhu}</TableCell>
                      <TableCell>{row.ketebalan}</TableCell>
                      <TableCell className="font-semibold">{row.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Kontrol Paginasi */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700 dark:text-white">
              Total {data?.pagination?.totalData || 0} data
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Sebelumnya</span>
              </Button>
              <span className="text-sm font-medium">
                Halaman {data?.pagination?.currentPage || 0} dari {data?.pagination?.totalPages || 0}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= data?.pagination?.totalPages || isLoading}
              >
                <span>Berikutnya</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
