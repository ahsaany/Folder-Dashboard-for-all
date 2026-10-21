/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Upload, 
  Sparkles, 
  Archive, 
  HelpCircle, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Layers,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { CogniaFolder, FolderFile } from './types';
import { 
  initializePortal, 
  refreshFolderStats, 
  seedSampleCogniaEvidence, 
  saveMultipleFiles 
} from './services/db';
import { exportAll35FoldersZip } from './services/exportService';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FolderCard } from './components/FolderCard';
import { FolderWorkspaceModal } from './components/FolderWorkspaceModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { Windows11GuideModal } from './components/Windows11GuideModal';

export default function App() {
  const [folders, setFolders] = useState<CogniaFolder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeWorkspaceFolder, setActiveWorkspaceFolder] = useState<CogniaFolder | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [batchUploadStatus, setBatchUploadStatus] = useState<string | null>(null);

  const masterDriveInputRef = useRef<HTMLInputElement | null>(null);

  // Load from IndexedDB on startup
  const loadData = async () => {
    try {
      const data = await initializePortal();
      setFolders(data);
    } catch (err) {
      console.error('Failed to initialize local portal DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Global keyboard listener for search shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as any)?.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRefresh = async () => {
    const updated = await refreshFolderStats();
    setFolders(updated);
    if (activeWorkspaceFolder) {
      const current = updated.find((f) => f.id === activeWorkspaceFolder.id);
      if (current) setActiveWorkspaceFolder(current);
    }
  };

  // Seed Realistic Sample Evidence
  const handleSeedSample = async () => {
    setIsSeeding(true);
    try {
      await seedSampleCogniaEvidence();
      await handleRefresh();
    } catch (err) {
      console.error('Sample seeding error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Export Full 35-Folder Archive
  const handleExportAllZip = async () => {
    try {
      await exportAll35FoldersZip(folders);
    } catch (err) {
      console.error('Export archive error:', err);
    }
  };

  // Master Drive Batch Upload: Upload an entire root folder containing 35 subfolders
  const handleMasterDriveUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    setBatchUploadStatus(`Analyzing ${rawFiles.length} files from local folder...`);

    const filesToStore: FolderFile[] = [];

    for (let i = 0; i < rawFiles.length; i++) {
      const file = rawFiles[i];
      const relPath = (file as any).webkitRelativePath || file.name;
      const pathParts = relPath.split('/');

      // Determine which folder this file belongs to:
      // Try to find a folder number from path, e.g. "Folder 1", "01", "Standard 1", etc.
      let targetFolderId = 1;

      if (pathParts.length > 1) {
        const parentFolderName = pathParts[1] || pathParts[0];
        // Match numbers like "1", "01", "Folder_14", "Standard 2.3", etc.
        const numMatch = parentFolderName.match(/\b([1-9]|[12][0-9]|3[0-5])\b/);
        if (numMatch) {
          const num = parseInt(numMatch[1], 10);
          if (num >= 1 && num <= 35) {
            targetFolderId = num;
          }
        } else {
          // Check matching folder name
          const matched = folders.find((f) =>
            parentFolderName.toLowerCase().includes(f.name.toLowerCase().substring(0, 10))
          );
          if (matched) targetFolderId = matched.id;
        }
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const uniqueId = `master_f${targetFolderId}_${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      filesToStore.push({
        id: uniqueId,
        folderId: targetFolderId,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        extension: ext,
        blob: file,
        lastModified: file.lastModified,
        uploadedAt: new Date().toISOString(),
        relativePath: relPath,
      });
    }

    setBatchUploadStatus(`Saving ${filesToStore.length} files to offline database...`);
    await saveMultipleFiles(filesToStore);
    await handleRefresh();

    setBatchUploadStatus(`Successfully archived ${filesToStore.length} files across standards!`);
    setTimeout(() => setBatchUploadStatus(null), 4000);

    if (e.target) e.target.value = '';
  };

  // Filter 35 Folders based on tabs and search query
  const filteredFolders = folders.filter((folder) => {
    // 1. Tab filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'populated' && folder.fileCount === 0) return false;
      if (selectedFilter === 'empty' && folder.fileCount > 0) return false;
      if (
        ['Leadership Capacity', 'Learning Capacity', 'Resource Capacity', 'Accreditation Exhibits'].includes(
          selectedFilter
        ) &&
        folder.domain !== selectedFilter
      ) {
        return false;
      }
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = folder.name.toLowerCase().includes(q);
      const matchCode = folder.standardCode.toLowerCase().includes(q);
      const matchDomain = folder.domain.toLowerCase().includes(q);
      const matchDesc = folder.description.toLowerCase().includes(q);
      return matchName || matchCode || matchDomain || matchDesc;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans selection:bg-emerald-700 selection:text-white">
      {/* Hidden Master Drive Webkit Directory Input */}
      <input
        ref={masterDriveInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={handleMasterDriveUpload}
      />

      {/* Windows 11 Header */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
        onExportAllZip={handleExportAllZip}
        onSeedSample={handleSeedSample}
        isSeeding={isSeeding}
      />

      {/* Batch Upload Notification */}
      {batchUploadStatus && (
        <div className="bg-emerald-800 text-amber-200 px-6 py-2.5 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>{batchUploadStatus}</span>
          </div>
          <button
            onClick={() => setBatchUploadStatus(null)}
            className="text-white hover:text-amber-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Banner Ribbon */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 text-amber-300 border border-emerald-600/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline-First Windows 11 Accreditation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
              Cognia Standards & Evidence Repository
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
              Organize, store, and view school evidence across 35 Cognia Performance Standards. 
              Upload entire directories with subfiles, read documents & PDFs directly in the offline viewer, and export complete accreditation archives.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => masterDriveInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm"
                title="Upload root school folder containing multiple standard subdirectories"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Upload Entire School Folder</span>
              </button>

              <button
                onClick={handleSeedSample}
                disabled={isSeeding}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Load Sample Evidence PDFs</span>
              </button>

              <button
                onClick={() => setGuideOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-200 hover:text-white transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Windows 11 Guide</span>
              </button>
            </div>
          </div>

          {/* Decorative Background Accent */}
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-12 top-6 opacity-10 hidden xl:block pointer-events-none">
            <Layers className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Statistics & Overview Bar */}
        <StatsBar
          folders={folders}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* 35 Folder Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Cognia Performance Standards
              </h3>
              <span className="text-xs font-mono font-semibold text-slate-500">
                ({filteredFolders.length} of 35 shown)
              </span>
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-700" />
              <p className="text-xs">Initializing local offline database...</p>
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <Folder className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
              <h4 className="font-bold text-sm text-slate-800">No standards match the current filter</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try resetting your search query or switching tabs back to "All Standards (35)".
              </p>
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
              {filteredFolders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onOpenWorkspace={(f) => setActiveWorkspaceFolder(f)}
                  onRefresh={handleRefresh}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Windows 11 Bottom Status Bar */}
      <footer className="mt-auto bg-white/80 backdrop-blur-md border-t border-slate-200/90 py-2.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Nada International School</span>
          <span>·</span>
          <span>Cognia Accreditation Management System</span>
          <span>·</span>
          <span className="text-emerald-800 font-semibold flex items-center gap-1">
            <Database className="w-3.5 h-3.5" />
            Local IndexedDB Online/Offline
          </span>
        </div>
        <div className="font-mono text-[11px] text-slate-400">
          35 Standards · Windows 11 Fluent Engine
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Dedicated Folder Workspace & Viewer */}
      {activeWorkspaceFolder && (
        <FolderWorkspaceModal
          folder={activeWorkspaceFolder}
          onClose={() => setActiveWorkspaceFolder(null)}
          onFolderUpdated={handleRefresh}
        />
      )}

      {/* 2. Global Search Modal */}
      {searchOpen && (
        <GlobalSearchModal
          folders={folders}
          onClose={() => setSearchOpen(false)}
          onSelectResult={(folder, file) => {
            setSearchOpen(false);
            setActiveWorkspaceFolder(folder);
          }}
        />
      )}

      {/* 3. Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          folders={folders}
          onClose={() => setSettingsOpen(false)}
          onRefresh={handleRefresh}
        />
      )}

      {/* 4. Windows 11 Desktop Guide Modal */}
      {guideOpen && <Windows11GuideModal onClose={() => setGuideOpen(false)} />}
    </div>
  );
}
