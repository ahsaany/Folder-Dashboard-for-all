import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  Search, 
  Settings, 
  Archive, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Calendar, 
  Clock as ClockIcon,
  HardDrive
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onExportAllZip: () => void;
  onSeedSample: () => void;
  isSeeding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenSettings,
  onOpenGuide,
  onExportAllZip,
  onSeedSample,
  isSeeding,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Top Windows 11 Title Strip */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Left: School Emblem & System Title */}
        <div className="flex items-center gap-3.5">
          <SchoolLogo size={40} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
                Nada International School Cognia Portal
              </h1>
              {/* Windows 11 Offline Status Badge */}
              <div 
                className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs"
                title="Application is 100% offline-first. All documents stored locally in IndexedDB."
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Offline Ready</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block mt-0.5">
              Accreditation Evidence Repository · 35 Cognia Performance Standards
            </p>
          </div>
        </div>

        {/* Center: Live Date & Dynamic Clock (Windows 11 Taskbar Style) */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-100/80 px-3.5 py-1.5 rounded-xl border border-slate-200/80 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{formattedDate}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-800 font-semibold">
            <ClockIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Global Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
            title="Search across all 35 folders (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Search Files</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.2 bg-white rounded text-[10px] text-slate-400 border border-slate-300 font-mono">
              /
            </kbd>
          </button>

          {/* Seed Sample Demo Data */}
          <button
            type="button"
            onClick={onSeedSample}
            disabled={isSeeding}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            title="Populate realistic Cognia sample evidence documents & PDFs"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>{isSeeding ? 'Seeding...' : 'Demo Samples'}</span>
          </button>

          {/* Export All 35 Folders ZIP */}
          <button
            type="button"
            onClick={onExportAllZip}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            title="Export full 35-folder archive as ZIP"
          >
            <Archive className="w-3.5 h-3.5 text-amber-300" />
            <span>Export Archive</span>
          </button>

          {/* Windows 11 Desktop Guide */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Windows 11 Offline Launch & PWA Guide"
          >
            <HelpCircle className="w-4 h-4 text-emerald-800" />
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Settings & Storage Analyzer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
