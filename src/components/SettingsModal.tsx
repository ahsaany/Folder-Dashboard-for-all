import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  HardDrive, 
  Trash2, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  Database, 
  Sliders, 
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CogniaFolder } from '../types';
import { getStorageMetrics, resetAllDataToDefault, seedSampleCogniaEvidence } from '../services/db';
import { exportAll35FoldersZip, formatBytes } from '../services/exportService';

interface SettingsModalProps {
  folders: CogniaFolder[];
  onClose: () => void;
  onRefresh: () => void;
  onDownloadOfflineApp: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  folders,
  onClose,
  onRefresh,
  onDownloadOfflineApp,
}) => {
  const [metrics, setMetrics] = useState<{ usedBytes: number; quotaBytes: number; fileCount: number }>({
    usedBytes: 0,
    quotaBytes: 1024 * 1024 * 1024,
    fileCount: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStorage = async () => {
      setLoadingMetrics(true);
      const data = await getStorageMetrics();
      setMetrics(data);
      setLoadingMetrics(false);
    };
    fetchStorage();
  }, [folders]);

  const handleResetData = async () => {
    if (
      window.confirm(
        'WARNING: This will reset all 35 folder titles to standard Cognia accreditation names and remove all uploaded evidence files from this browser. Are you sure you wish to continue?'
      )
    ) {
      await resetAllDataToDefault();
      setActionMessage('Database cleared and reset to Cognia 35 Standards baseline.');
      onRefresh();
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleSeedSamples = async () => {
    await seedSampleCogniaEvidence();
    setActionMessage('Sample Cognia evidence documents and PDFs generated.');
    onRefresh();
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleExportZip = async () => {
    await exportAll35FoldersZip(folders);
    setActionMessage('Exporting complete 35-folder ZIP archive...');
    setTimeout(() => setActionMessage(null), 3000);
  };

  const usedPercentage = Math.min(
    Math.round((metrics.usedBytes / (metrics.quotaBytes || 1)) * 1000) / 10,
    100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Portal Settings & Storage</h3>
              <p className="text-xs text-slate-500">
                Offline persistence and local database management
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

        {/* Action Message Banner */}
        {actionMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Storage Gauge */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-800" />
                <span className="text-xs font-semibold text-slate-800">
                  Local Offline Storage (IndexedDB)
                </span>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-600">
                {formatBytes(metrics.usedBytes)} of {formatBytes(metrics.quotaBytes)} used
              </span>
            </div>

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-700 transition-all duration-300"
                style={{ width: `${Math.max(usedPercentage, metrics.fileCount > 0 ? 3 : 0)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>{metrics.fileCount} Total Cached Files</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Persistent Offline
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Data Management & Backup
            </h4>

            {/* Download Standalone Offline App Package */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
              <div>
                <p className="text-xs font-bold text-emerald-950">Download Standalone Offline App (.ZIP)</p>
                <p className="text-[11px] text-emerald-800">
                  Save entire portal into a local folder on Windows with 1-click batch launcher.
                </p>
              </div>
              <button
                onClick={onDownloadOfflineApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900 hover:bg-black text-amber-300 rounded-lg text-xs font-bold transition-colors shrink-0 shadow-2xs"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-300" />
                <span>Download App</span>
              </button>
            </div>

            {/* Export All 35 Folders */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div>
                <p className="text-xs font-bold text-slate-800">Export All 35 Folders (ZIP)</p>
                <p className="text-[11px] text-slate-500">
                  Download structured ZIP archive of all 35 Cognia folders and subfiles.
                </p>
              </div>
              <button
                onClick={handleExportZip}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>Download Archive</span>
              </button>
            </div>

            {/* Seed Sample Evidence */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <div>
                <p className="text-xs font-bold text-slate-800">Populate Sample Cognia Evidence</p>
                <p className="text-[11px] text-slate-500">
                  Generate sample accreditation PDFs and spreadsheets to demo the viewer.
                </p>
              </div>
              <button
                onClick={handleSeedSamples}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add Samples</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Reset & Clear Data
            </h4>
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
              <div>
                <p className="text-xs font-bold text-rose-900">Reset Portal to Default Standards</p>
                <p className="text-[11px] text-rose-700">
                  Removes all uploaded evidence files and resets 35 folder titles to initial presets.
                </p>
              </div>
              <button
                onClick={handleResetData}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Nada International School · Windows 11 Offline Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
