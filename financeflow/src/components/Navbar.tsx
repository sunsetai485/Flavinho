'use client';

import { useRef, useState } from 'react';
import { Moon, Sun, Upload, FileDown, LogOut, Menu, X } from 'lucide-react';

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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0">F</div>
            <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight truncate">
              Finance<span className="text-brand-600">Flow</span>
              <span className="hidden sm:inline text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 ml-1">PRO</span>
            </span>
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-2 md:gap-3">
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

          {/* Mobile actions */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {isDark ? <Sun className="h-4 w-4 text-slate-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            <label className="cursor-pointer p-2 rounded-lg bg-brand-600 text-white">
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onImportFile(f);
                  e.currentTarget.value = '';
                }}
              />
            </label>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              {mobileOpen ? <X className="h-5 w-5 text-slate-600 dark:text-slate-400" /> : <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 animate-fade-in">
          <div className="px-4 py-3 space-y-2">
            <button
              onClick={() => { onExportPDF(); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-medium"
              disabled={isLoading}
            >
              <FileDown className="h-4 w-4 text-emerald-600" />
              Exportar PDF
            </button>
            <button
              onClick={() => { onLogout(); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-medium text-rose-600"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
