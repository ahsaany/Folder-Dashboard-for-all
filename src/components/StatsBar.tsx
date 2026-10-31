import React from 'react';
import { 
  FolderCheck, 
  Files, 
  HardDrive, 
  Award, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import { CogniaFolder } from '../types';
import { formatBytes } from '../services/exportService';

interface StatsBarProps {
  folders: CogniaFolder[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCogniaEvaluation?: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  folders,
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  onOpenCogniaEvaluation,
}) => {
  const populatedFolders = folders.filter((f) => f.fileCount > 0);
  const totalFiles = folders.reduce((sum, f) => sum + f.fileCount, 0);
  const totalSize = folders.reduce((sum, f) => sum + f.totalSize, 0);

  const completionPercent = folders.length > 0 ? Math.round((populatedFolders.length / folders.length) * 100) : 0;

  const filters = [
    { id: 'all', label: `All Modules (${folders.length})` },
    { id: 'Leadership Capacity', label: 'Leadership' },
    { id: 'Learning Capacity', label: 'Learning' },
    { id: 'Resource Capacity', label: 'Resources' },
    { id: 'Accreditation Exhibits', label: 'Exhibits' },
    { id: 'populated', label: `Populated (${populatedFolders.length})` },
    { id: 'empty', label: `Pending (${folders.length - populatedFolders.length})` },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Windows 11 Fluent Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Modules Progress */}
        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Accreditation Modules</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {populatedFolders.length} <span className="text-sm font-normal text-slate-400">/ {folders.length}</span>
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              {completionPercent}% Ready
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-emerald-700 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Total Files Archived */}
        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Archived Documents</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100">
              <Files className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {totalFiles}
            </span>
            <span className="text-xs text-slate-500">evidence files</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 truncate">
            PDFs, audio, video, photos & logs
          </p>
        </div>

        {/* Metric 3: Offline Storage */}
        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Local Storage Used</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-100">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatBytes(totalSize)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 truncate">
            100% offline IndexedDB cache
          </p>
        </div>

        {/* Metric 4: Compliance Status & Live Gauge Trigger */}
        <div 
          onClick={onOpenCogniaEvaluation}
          className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to open Cognia AI Audit & Live Moving Gauge"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-emerald-800 transition-colors">
              Portal Readiness & Gauge
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900">
              {completionPercent >= 80 ? 'Accreditation Ready' : completionPercent >= 40 ? 'Review In Progress' : 'Initial Phase'}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span>●</span>
              <span>All evidence saved</span>
            </span>
            <span className="font-bold underline text-[10px] group-hover:translate-x-0.5 transition-transform">
              Open Gauge →
            </span>
          </p>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1 px-2 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Filter:</span>
          </div>
          {filters.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedFilter === tab.id
                  ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
