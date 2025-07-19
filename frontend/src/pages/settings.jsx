import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from 'lucide-react';

export default function Settings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="w-full">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pengaturan</h1>
        </div>
      </header>
      <main className="w-full mx-auto p-6">
        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Tampilan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg dark:bg-gray-700">
              <div className="flex items-center space-x-2">
                {theme === 'light' ? <Sun className="text-yellow-500" /> : <Moon className="text-indigo-400" />}
                <Label htmlFor="theme-switch" className="font-medium">
                  Mode {theme === 'light' ? 'Terang' : 'Gelap'}
                </Label>
              </div>
              <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
