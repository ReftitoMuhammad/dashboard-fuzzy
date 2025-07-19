import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Memuat Data...' }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-gray-500">
      <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      <p className="mt-4 text-lg font-semibold">{text}</p>
    </div>
  );
}
