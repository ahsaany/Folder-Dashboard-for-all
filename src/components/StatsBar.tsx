import React from 'react';
import { 
  FolderCheck, 
  Files, 
  HardDrive, 
  Award, 
  CheckCircle2, 
  Filter 
} from 'lucide-react';
import { CogniaFolder, CogniaDomain } from '../types';
import { formatBytes } from '../services/exportService';

interface StatsBarProps {
  folders: CogniaFolder[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  folders,
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
}) => {
  const populatedFolders = folders.filter((f) => f.fileCount > 0);
  const totalFiles = folders.reduce((sum, f) => sum + f.fileCount, 0);
  const totalSize = folders.reduce((sum, f) => sum + f.totalSize, 0);

  const completionPercent = Math.round((populatedFolders.length / folders.length) * 100);

  const filters = [
    { id: 'all', label: 'All Standards (35)' },
    { id: 'Leadership Capacity', label: 'Leadership (1-10)' },
    { id: 'Learning Capacity', label: 'Learning (11-22)' },
    { id: 'Resource Capacity', label: 'Resources (23-29)' },
    { id: 'Accreditation Exhibits', label: 'Exhibits (30-35)' },
    { id: 'populated', label: `Populated (${populatedFolders.length})` },
    { id: 'empty', label: `Pending (${folders.length - populatedFolders.length})` },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Windows 11 Fluent Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Standards Progress */}
        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Accreditation Dossier</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {populatedFolders.length} <span className="text-sm font-normal text-slate-400">/ 35</span>
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
            PDFs, spreadsheets, logs & scans
          </p>
        </div>

        {/* Metric 3: Offline Storage */}
        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Local Offline Cache</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-100">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {formatBytes(totalSize)}
            </span>
            <span className="text-xs text-emerald-700 font-medium">IndexedDB</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5">
            Zero cloud dependency required
          </p>
        </div>

        {/* Metric 4: Standards Breakdown */}
        <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Cognia Framework</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center border border-purple-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
            <span>4 Domains Evaluated</span>
          </div>
          <div className="flex items-center gap-1 mt-3">
            <span className="h-1.5 flex-1 bg-emerald-600 rounded-full" title="Leadership (10)" />
            <span className="h-1.5 flex-1 bg-green-500 rounded-full" title="Learning (12)" />
            <span className="h-1.5 flex-1 bg-amber-500 rounded-full" title="Resources (7)" />
            <span className="h-1.5 flex-1 bg-blue-500 rounded-full" title="Exhibits (6)" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white/70 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1">
          {filters.map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search input for folder cards */}
        <div className="relative min-w-[240px] px-1">
          <input
            type="text"
            placeholder="Filter 35 folders by standard or name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-3 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
