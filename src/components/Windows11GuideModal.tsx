import React from 'react';
import { X, Monitor, Download, HardDrive, ShieldCheck, Terminal, FolderCheck, Check } from 'lucide-react';

interface Windows11GuideModalProps {
  onClose: () => void;
  onDownloadOfflineApp: () => void;
}

export const Windows11GuideModal: React.FC<Windows11GuideModalProps> = ({ onClose, onDownloadOfflineApp }) => {
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
                Download & Run Software Offline on Windows 11
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
          {/* Quick 1-Click Action: Download ZIP */}
          <div className="p-5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-2xl shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 font-mono">
                  Recommended Offline Package
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  Download Standalone Offline App (.ZIP)
                </h4>
                <p className="text-xs text-emerald-100 leading-relaxed mt-1">
                  Downloads a complete ZIP bundle with <code className="bg-emerald-950/60 px-1 py-0.5 rounded text-amber-200">RUN_OFFLINE_PORTAL.bat</code>. 
                  Extract to any folder on your Windows 11 machine and double-click to launch without needing Wi-Fi or internet.
                </p>
              </div>
            </div>
            <button
              onClick={onDownloadOfflineApp}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Offline Software Bundle (.ZIP)</span>
            </button>
          </div>

          {/* Method 1: 1-Click RUN_OFFLINE_PORTAL.bat Launcher */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>1-Click Offline Launcher: RUN_OFFLINE_PORTAL.bat (Recommended)</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Yeh method bina kisi Node.js ya extra software ke direct Windows 11 par chalta hai:
            </p>
            <ol className="text-xs text-emerald-900 list-decimal list-inside space-y-1.5 pl-2 font-medium">
              <li>Downloaded ZIP file ko right-click karke <span className="font-bold">Extract All</span> karein kisi folder mein (jaise <code className="bg-white px-1 py-0.5 rounded text-emerald-950">C:\NIS_Cognia_Portal</code> ya Desktop).</li>
              <li>Folder open karein aur <span className="font-bold text-emerald-950">RUN_OFFLINE_PORTAL.bat</span> par double click karein.</li>
              <li>Ek black command window open hogi jo local server start karegi, aur Microsoft Edge automatically <span className="font-bold">http://localhost:3000</span> par app mode mein open ho jayega!</li>
              <li><span className="text-amber-800 font-bold">Important:</span> Black command window ko band mat karein (minimize kar sakte hain), jab tak app use karni ho.</li>
            </ol>
          </div>

          {/* Method 2: Browser Install (PWA Desktop App) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>Install directly to Windows 11 Taskbar (Edge / Chrome PWA)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jab portal browser mein open ho:
            </p>
            <ol className="text-xs text-slate-700 list-decimal list-inside space-y-1.5 pl-2">
              <li>Browser ke address bar par right side mein <span className="font-bold">App Install icon</span> par click karein (ya menu <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px]">···</kbd> &rarr; <span className="font-bold">Apps</span> &rarr; <span className="font-bold">Install this site as an app</span>).</li>
              <li><span className="font-bold">Install</span> par click karein aur <span className="font-bold">Pin to Taskbar</span> select karein.</li>
              <li>Ab aap desktop icon par click karke direct offline app chala sakte hain!</li>
            </ol>
          </div>

          {/* Method 3: Running Locally with Node.js */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Developer Run via Node.js (RUN_WITH_NODEJS.bat)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Agar aapke computer mein Node.js installed hai:
            </p>
            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs space-y-1">
              <p className="text-slate-400"># Simply double click RUN_WITH_NODEJS.bat or run:</p>
              <p className="text-white">cd source</p>
              <p className="text-white">npm install</p>
              <p className="text-emerald-400">npm run dev</p>
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
