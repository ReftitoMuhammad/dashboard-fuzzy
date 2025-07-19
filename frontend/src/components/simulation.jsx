import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrainCircuit, BotMessageSquare, Loader2 } from 'lucide-react';

export default function SimulationCard() {
  const [inputs, setInputs] = useState({ tekanan: 32, suhu: 45, ketebalan: 7 });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch('http://localhost:3001/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Gagal menjalankan simulasi:", error);
      setResult({ narrative: "Gagal terhubung ke server analisis." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-full">
      <div className="flex items-center space-x-2 border-b pb-3 mb-4">
        <BrainCircuit className="h-6 w-6 text-indigo-600" />
        <h3 className="font-bold text-lg">Pusat Analisis & Prediksi</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Sliders */}
        <div>
          <Label htmlFor="tekanan">Tekanan (psi): {inputs.tekanan}</Label>
          <Input type="range" id="tekanan" name="tekanan" min="20" max="45" value={inputs.tekanan} onChange={handleInputChange} disabled={isLoading} />
        </div>
        <div>
          <Label htmlFor="suhu">Suhu (°C): {inputs.suhu}</Label>
          <Input type="range" id="suhu" name="suhu" min="20" max="100" value={inputs.suhu} onChange={handleInputChange} disabled={isLoading} />
        </div>
        <div>
          <Label htmlFor="ketebalan">Ketebalan (mm): {inputs.ketebalan}</Label>
          <Input type="range" id="ketebalan" name="ketebalan" min="1" max="10" value={inputs.ketebalan} onChange={handleInputChange} disabled={isLoading} />
        </div>
        
        <Button type="submit" className="w-full dark:bg-gray-700 dark:text-white" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Jalankan Analisis
        </Button>
      </form>

      {/* Hasil Prediksi */}
      {result && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-3">
            <BotMessageSquare className="h-6 w-6 text-indigo-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white">Hasil Analisis:</h4>
              <p className="text-gray-700 dark:text-white text-sm">{result.narrative || "Tidak ada narasi."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
