import React from 'react';
import { X, Monitor, Download, HardDrive, ShieldCheck, Terminal, FolderCheck, Check } from 'lucide-react';

interface Windows11GuideModalProps {
  onClose: () => void;
}

export const Windows11GuideModal: React.FC<Windows11GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-800 text-amber-300 shadow-2xs">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Windows 11 Desktop Launch & Offline Guide
              </h3>
              <p className="text-xs text-slate-500">
                Nada International School Cognia Portal Deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Method 1: Instant Windows 11 PWA Desktop App (Recommended) */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>Install as Windows 11 Desktop Application (Recommended)</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              You can run this portal as an official, standalone Windows 11 window with its own icon on your Taskbar and Start Menu without any code changes:
            </p>
            <ol className="text-xs text-emerald-900 list-decimal list-inside space-y-1.5 pl-2 font-medium">
              <li>In Microsoft Edge or Google Chrome on Windows 11, click the three dots menu (<kbd className="px-1.5 py-0.5 bg-white border border-emerald-300 rounded text-[10px]">···</kbd>).</li>
              <li>Select <span className="font-bold">Apps</span> &rarr; <span className="font-bold">Install this site as an app</span>.</li>
              <li>Name it: <span className="font-bold text-emerald-950">Nada International School Cognia Portal</span>.</li>
              <li>Check <span className="font-bold">Pin to Taskbar</span> and <span className="font-bold">Pin to Start</span>.</li>
              <li>The app now launches in its own isolated Windows 11 frame, completely offline!</li>
            </ol>
          </div>

          {/* Method 2: Running Locally with Node.js / Vite */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Running Locally via Terminal (Windows PowerShell / CMD)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If running from a local folder on your computer:
            </p>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs space-y-1">
              <p># 1. Install dependencies</p>
              <p className="text-white">npm install</p>
              <p className="pt-1 text-emerald-400"># 2. Launch the Windows 11 offline portal</p>
              <p className="text-white">npm run dev</p>
            </div>
            <p className="text-[11px] text-slate-500">
              Open <span className="font-mono font-semibold text-slate-700">http://localhost:3000</span>.
            </p>
          </div>

          {/* Method 3: Electron Wrapper */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Packaging with Electron (.exe installer for Windows 11)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              To package into a single standalone <span className="font-mono text-emerald-800 font-semibold">NIS_Cognia_Portal.exe</span>:
            </p>
            <div className="bg-slate-900 text-slate-300 p-3 rounded-xl font-mono text-xs space-y-1">
              <p className="text-emerald-400">npm run build</p>
              <p className="text-slate-400"># Electron main process loads dist/index.html with full local filesystem access</p>
            </div>
          </div>

          {/* Offline Persistence Guarantee */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">100% Offline Persistence Guarantee</p>
              <p className="text-amber-800 mt-0.5">
                All 35 folders, uploaded PDFs, evidence documents, and metadata are saved permanently inside your local browser/app IndexedDB. You can restart your computer, close the window, or disconnect from Wi-Fi entirely; all files remain safely preserved.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            Got it, continue to portal
          </button>
        </div>
      </div>
    </div>
  );
};
