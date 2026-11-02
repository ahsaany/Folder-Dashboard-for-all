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
  HardDrive,
  Palette,
  Activity,
  FileText,
  Pencil
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenTheme: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenCogniaEvaluation: () => void;
  onViewCogniaPdf: () => void;
  onExportAllZip: () => void;
  onDownloadOfflineApp: () => void;
  onSeedSample: () => void;
  isSeeding: boolean;
  schoolName: string;
  customLogo?: string | null;
  onOpenBrandingSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenTheme,
  onOpenSettings,
  onOpenGuide,
  onOpenCogniaEvaluation,
  onViewCogniaPdf,
  onExportAllZip,
  onDownloadOfflineApp,
  onSeedSample,
  isSeeding,
  schoolName,
  customLogo,
  onOpenBrandingSettings,
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
        {/* Left: School Emblem & System Title with Edit Branding Trigger */}
        <div className="flex items-center gap-3.5">
          <div 
            onClick={onOpenBrandingSettings}
            className="cursor-pointer group relative"
            title="Click to replace School Emblem Logo"
          >
            <SchoolLogo size={46} customLogo={customLogo} />
            <span className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full shadow-xs border border-slate-200 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil className="w-2.5 h-2.5 text-emerald-700" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenBrandingSettings}
                className="group flex items-center gap-1.5 text-left text-slate-900 hover:text-emerald-900 transition-colors"
                title="Click to edit school name or replace logo"
              >
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight leading-none group-hover:underline">
                  {schoolName} Cognia Portal
                </h1>
                <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

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
              Accreditation Evidence Repository · Performance Modules & Evidences
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

          {/* Cognia Audit & Animated Moving Gauge Button */}
          <button
            type="button"
            onClick={onOpenCogniaEvaluation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-lg text-xs font-bold shadow-2xs border border-emerald-600/70 transition-all hover:scale-102"
            title="Open Cognia Audit Diagnostic, Live Speedometer Gauge & Evidence Gap Analyzer"
          >
            <Activity className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Audit Gauge</span>
            <span className="hidden xl:inline text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black font-mono">
              LIVE
            </span>
          </button>

          {/* View Official Cognia Cards PDF */}
          <button
            type="button"
            onClick={onViewCogniaPdf}
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
            title="View Cognia Performance Standards Resource Cards PDF"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Cognia PDF</span>
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
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            title="Export full 35-folder archive as ZIP"
          >
            <Archive className="w-3.5 h-3.5 text-amber-300" />
            <span>Export Archive</span>
          </button>

          {/* Download Full Standalone Offline App Package */}
          <button
            type="button"
            onClick={onDownloadOfflineApp}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900 hover:bg-black text-amber-300 rounded-lg text-xs font-bold shadow-2xs border border-emerald-700/80 transition-colors"
            title="Download complete offline software folder (.ZIP) with Windows 11 launcher"
          >
            <HardDrive className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Download App (.ZIP)</span>
          </button>

          {/* Theme Palette Switcher */}
          <button
            type="button"
            onClick={onOpenTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 text-xs font-semibold transition-colors"
            title="Change Theme Colors (Brown, Gold, Green, White & Rich Combos)"
          >
            <Palette className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Theme</span>
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
