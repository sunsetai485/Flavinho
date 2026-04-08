'use client';

import { useRef } from 'react';
import { Moon, Sun, Upload, FileDown, LogOut } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onImportFile: (file: File) => void;
  onExportPDF: () => void;
  onLogout: () => void;
  isLoading: boolean;
}

export default function Navbar({ isDark, onToggleTheme, onImportFile, onExportPDF, onLogout, isLoading }: NavbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
            <span className="font-display text-xl font-extrabold tracking-tight">
              Finance<span className="text-brand-600">Flow</span>
              <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 ml-1">PRO</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExportPDF}
              className="hidden md:flex btn-success items-center gap-2"
              disabled={isLoading}
            >
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </button>

            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Alternar tema"
            >
              {isDark ? <Sun className="h-5 w-5 text-slate-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
            </button>

            <label className="cursor-pointer btn-primary flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImportFile(f);
                  if (fileRef.current) fileRef.current.value = '';
                }}
              />
            </label>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Sair"
            >
              <LogOut className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
