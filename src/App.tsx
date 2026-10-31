/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Database,
  Trash2,
  CheckSquare,
  Square,
  Plus,
  SlidersHorizontal,
  X,
  Activity,
  FileText
} from 'lucide-react';
import { CogniaFolder, FolderFile, CogniaDomain, FOLDER_COLOR_PALETTE } from './types';
import { 
  initializePortal, 
  refreshFolderStats, 
  seedSampleCogniaEvidence, 
  saveMultipleFiles,
  deleteFolder,
  deleteMultipleFolders,
  addFolder
} from './services/db';
import { exportAll35FoldersZip, downloadOfflineAppPackage } from './services/exportService';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FolderCard } from './components/FolderCard';
import { FolderWorkspaceModal } from './components/FolderWorkspaceModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SettingsModal } from './components/SettingsModal';
import { Windows11GuideModal } from './components/Windows11GuideModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { ConfirmModal, ConfirmDialogState } from './components/ConfirmModal';
import { CogniaEvaluationModal } from './components/CogniaEvaluationModal';
import { PdfViewer } from './components/PdfViewer';
import { ThemeId, PORTAL_THEMES } from './types/theme';

export default function App() {
  const [folders, setFolders] = useState<CogniaFolder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeWorkspaceFolder, setActiveWorkspaceFolder] = useState<CogniaFolder | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [themeModalOpen, setThemeModalOpen] = useState<boolean>(false);
  const [cogniaEvaluationOpen, setCogniaEvaluationOpen] = useState<boolean>(false);
  const [cogniaPdfModalOpen, setCogniaPdfModalOpen] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Theme selection state with localStorage persistence
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('nada_cognia_portal_theme') as ThemeId;
      if (saved && PORTAL_THEMES[saved]) return saved;
    } catch {}
    return 'combo-royal';
  });

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [batchUploadStatus, setBatchUploadStatus] = useState<string | null>(null);

  // Manage / Select Multiple Modules State
  const [isManageModulesMode, setIsManageModulesMode] = useState<boolean>(false);
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<number>>(new Set());

  // Add Module Modal State
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState<boolean>(false);
  const [newModuleName, setNewModuleName] = useState<string>('');
  const [newModuleDomain, setNewModuleDomain] = useState<CogniaDomain>('Leadership Capacity');
  const [newModuleDescription, setNewModuleDescription] = useState<string>('');
  const [newModuleColor, setNewModuleColor] = useState<string>('#1B5E20');

  const masterDriveInputRef = useRef<HTMLInputElement | null>(null);

  const currentTheme = PORTAL_THEMES[currentThemeId] || PORTAL_THEMES['combo-royal'];

  const handleSelectTheme = (themeId: ThemeId) => {
    setCurrentThemeId(themeId);
    try {
      localStorage.setItem('nada_cognia_portal_theme', themeId);
    } catch {}
  };

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

  // Export Full Folder Archive
  const handleExportAllZip = async () => {
    try {
      await exportAll35FoldersZip(folders);
    } catch (err) {
      console.error('Export archive error:', err);
    }
  };

  // Download Standalone Offline Windows App Package (.ZIP)
  const handleDownloadOfflineApp = async () => {
    try {
      setBatchUploadStatus('Generating offline Windows 11 standalone package (.ZIP)...');
      await downloadOfflineAppPackage();
      setBatchUploadStatus('Offline package downloaded! Extract to any folder and run RUN_OFFLINE_PORTAL.bat.');
      setTimeout(() => setBatchUploadStatus(null), 5000);
    } catch (err) {
      console.error('Download offline app error:', err);
      setBatchUploadStatus('Download failed. Please try again.');
    }
  };

  // Delete Single Module
  const handleDeleteSingleModule = (folderId: number) => {
    const target = folders.find((f) => f.id === folderId);
    setConfirmDialog({
      isOpen: true,
      title: `Delete Module ${String(folderId).padStart(2, '0')}`,
      message: `Are you sure you want to delete Module ${folderId} ("${target?.name || ''}") and all its stored files?`,
      confirmLabel: 'Delete Module',
      isDestructive: true,
      onConfirm: async () => {
        await deleteFolder(folderId);
        await handleRefresh();
        setBatchUploadStatus(`Module ${String(folderId).padStart(2, '0')} deleted successfully.`);
        setTimeout(() => setBatchUploadStatus(null), 3000);
      },
    });
  };

  // Toggle selection of module in manage mode
  const handleToggleSelectModule = (folderId: number) => {
    const next = new Set(selectedModuleIds);
    if (next.has(folderId)) {
      next.delete(folderId);
    } else {
      next.add(folderId);
    }
    setSelectedModuleIds(next);
  };

  // Select / Deselect All Modules
  const handleToggleSelectAllModules = () => {
    if (selectedModuleIds.size === filteredFolders.length && filteredFolders.length > 0) {
      setSelectedModuleIds(new Set());
    } else {
      setSelectedModuleIds(new Set(filteredFolders.map((f) => f.id)));
    }
  };

  // Bulk Delete Selected Modules
  const handleDeleteSelectedModules = () => {
    const count = selectedModuleIds.size;
    if (count === 0) return;

    setConfirmDialog({
      isOpen: true,
      title: `Delete ${count} Selected Module${count > 1 ? 's' : ''}`,
      message: `Are you sure you want to delete ${count} selected accreditation module${count > 1 ? 's' : ''} and all their stored files? This cannot be undone.`,
      confirmLabel: `Delete (${count})`,
      isDestructive: true,
      onConfirm: async () => {
        await deleteMultipleFolders(Array.from(selectedModuleIds));
        setSelectedModuleIds(new Set());
        setIsManageModulesMode(false);
        await handleRefresh();
        setBatchUploadStatus(`${count} module${count > 1 ? 's' : ''} deleted successfully.`);
        setTimeout(() => setBatchUploadStatus(null), 3500);
      },
    });
  };

  // Add New Custom Module
  const handleCreateNewModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    // Determine next ID
    const maxId = folders.reduce((max, f) => Math.max(max, f.id), 0);
    const nextId = maxId + 1;

    const newFolder: CogniaFolder = {
      id: nextId,
      name: newModuleName.trim(),
      domain: newModuleDomain,
      description: newModuleDescription.trim() || 'Accreditation evidence module.',
      suggestedEvidences: ['Evidence documentation', 'Audit records'],
      fileCount: 0,
      totalSize: 0,
      color: newModuleColor,
      lastUpdated: new Date().toISOString(),
    };

    await addFolder(newFolder);
    setNewModuleName('');
    setNewModuleDescription('');
    setIsAddModuleModalOpen(false);
    setSelectedFilter('all'); // Show all modules so the newly added module is immediately in view!
    await handleRefresh();
    setBatchUploadStatus(`Module ${String(nextId).padStart(2, '0')} ("${newFolder.name}") created successfully!`);
    setTimeout(() => setBatchUploadStatus(null), 4000);
  };

  // Master Drive Batch Upload: Upload an entire root folder containing subfolders
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
      let targetFolderId = 1;
      let detectedSubfolder: string | undefined = undefined;

      if (pathParts.length > 1) {
        const parentFolderName = pathParts[1] || pathParts[0];
        const numMatch = parentFolderName.match(/\b([1-9]|[12][0-9]|3[0-9]|4[0-9]|50)\b/);
        if (numMatch) {
          const num = parseInt(numMatch[1], 10);
          if (folders.some((f) => f.id === num)) {
            targetFolderId = num;
          }
        } else {
          const matched = folders.find((f) =>
            parentFolderName.toLowerCase().includes(f.name.toLowerCase().substring(0, 8))
          );
          if (matched) targetFolderId = matched.id;
        }

        // Check if there is an inner subfolder level
        if (pathParts.length > 3) {
          detectedSubfolder = pathParts.slice(2, pathParts.length - 1).join(' / ');
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
        subfolder: detectedSubfolder,
      });
    }

    setBatchUploadStatus(`Saving ${filesToStore.length} files to offline database...`);
    await saveMultipleFiles(filesToStore);
    await handleRefresh();

    setBatchUploadStatus(`Successfully archived ${filesToStore.length} files across modules!`);
    setTimeout(() => setBatchUploadStatus(null), 4000);

    if (e.target) e.target.value = '';
  };

  // Filter Folders based on tabs and search query
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
      const matchDomain = folder.domain.toLowerCase().includes(q);
      const matchDesc = folder.description.toLowerCase().includes(q);
      const matchModule = `module ${folder.id}`.includes(q) || `folder ${folder.id}`.includes(q);
      return matchName || matchDomain || matchDesc || matchModule;
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
        onOpenTheme={() => setThemeModalOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
        onOpenCogniaEvaluation={() => setCogniaEvaluationOpen(true)}
        onViewCogniaPdf={() => setCogniaPdfModalOpen(true)}
        onExportAllZip={handleExportAllZip}
        onDownloadOfflineApp={handleDownloadOfflineApp}
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
        {/* Top Banner Ribbon with School Logo on the Right */}
        <div className={`bg-gradient-to-r ${currentTheme.bannerGradient} text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 border ${currentTheme.bannerBorder}`}>
          <div className="relative z-10 max-w-3xl space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${currentTheme.heroBadge}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline-First Windows 11 Accreditation Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
              Cognia Standards & Evidence Repository
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-2xl">
              Organize, store, and view school evidence across performance modules. 
              Upload entire directories with subfolders, read documents, PDFs, audio & video directly in the offline viewer, and export complete accreditation archives.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={handleDownloadOfflineApp}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${currentTheme.heroButton}`}
                title="Download this software into an offline folder (.ZIP) with 1-click launcher"
              >
                <Database className="w-4 h-4" />
                <span>Download Offline App Folder (.ZIP)</span>
              </button>

              {/* Cognia AI Audit Moving Gauge Button */}
              <button
                onClick={() => setCogniaEvaluationOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                title="Open animated moving speedometer gauge and audit readiness analyzer (خودکار تشخیصی تجزیہ)"
              >
                <Activity className="w-4 h-4 text-slate-950 animate-spin" />
                <span>Cognia Audit Gauge (خودکار تجزیہ)</span>
              </button>

              <button
                onClick={() => masterDriveInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-md transition-all"
                title="Upload root school folder containing multiple module subdirectories"
              >
                <FolderPlus className="w-4 h-4 text-emerald-300" />
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
                <span>Offline Guide</span>
              </button>
            </div>
          </div>

          {/* Nada International School Logo prominently in front on the most Right Side */}
          <div className="shrink-0 flex items-center justify-center relative z-20">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-300">
              <img
                src="/assets/aistudio/Nada_International_School_Logo_68af40dc.png"
                alt="Nada International School"
                className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Decorative Background Accent */}
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Statistics & Overview Bar */}
        <StatsBar
          folders={folders}
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCogniaEvaluation={() => setCogniaEvaluationOpen(true)}
        />

        {/* Module Management & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900">
              Accreditation Modules
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-500">
              ({filteredFolders.length} shown)
            </span>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Module Action Controls: Manage Modules, Bulk Delete, Add Module */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Manage / Select Modules Toggle */}
            <button
              onClick={() => {
                if (isManageModulesMode) {
                  setSelectedModuleIds(new Set());
                  setIsManageModulesMode(false);
                } else {
                  setIsManageModulesMode(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isManageModulesMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
              }`}
              title="Select Multiple Modules to Bulk Delete"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isManageModulesMode ? 'Done Selecting' : 'Select Modules'}</span>
            </button>

            {/* In Manage Mode: Select All & Bulk Delete */}
            {isManageModulesMode && (
              <div className="flex items-center gap-2 animate-in fade-in">
                <button
                  onClick={handleToggleSelectAllModules}
                  className="px-2.5 py-1.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {selectedModuleIds.size === filteredFolders.length && filteredFolders.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </button>

                <button
                  onClick={handleDeleteSelectedModules}
                  disabled={selectedModuleIds.size === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedModuleIds.size > 0
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedModuleIds.size})</span>
                </button>
              </div>
            )}

            {/* Add New Module Button */}
            <button
              onClick={() => setIsAddModuleModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Module</span>
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <section>
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-800 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">Loading offline portal database...</p>
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
              <h4 className="text-base font-bold text-slate-800 mb-1">No matching modules found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                Try adjusting your search query or add a new module to this accreditation portal.
              </p>
              <button
                onClick={() => {
                  setSelectedFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-semibold hover:bg-emerald-900"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredFolders.map((folder, index) => (
                  <FolderCard
                    key={folder.id}
                    index={index}
                    folder={folder}
                    onOpenWorkspace={(f) => setActiveWorkspaceFolder(f)}
                    onRefresh={handleRefresh}
                    onDeleteFolder={handleDeleteSingleModule}
                    isManageMode={isManageModulesMode}
                    isSelected={selectedModuleIds.has(folder.id)}
                    onToggleSelect={handleToggleSelectModule}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Footer Strip */}
      <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-md py-4 px-6 text-center text-xs text-slate-500 mt-12 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Nada International School Cognia Portal</span>
          <span>·</span>
          <span>Offline Accreditation Workspace</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span>Windows 11 Fluent Edition</span>
          <span>·</span>
          <span>100% Offline IndexedDB Data Storage</span>
        </div>
      </footer>

      {/* Add Module Modal */}
      {isAddModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Accreditation Module</h3>
              <button
                onClick={() => setIsAddModuleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewModule} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Module Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Student Leadership Council, STEM Exhibits..."
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Domain / Category
                </label>
                <select
                  value={newModuleDomain}
                  onChange={(e) => setNewModuleDomain(e.target.value as CogniaDomain)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white text-slate-800"
                >
                  <option value="Leadership Capacity">Leadership Capacity</option>
                  <option value="Learning Capacity">Learning Capacity</option>
                  <option value="Resource Capacity">Resource Capacity</option>
                  <option value="Accreditation Exhibits">Accreditation Exhibits</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the accreditation requirements..."
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Folder Theme Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_COLOR_PALETTE.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewModuleColor(c.hex)}
                      className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:scale-115 transition-transform"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {newModuleColor === c.hex && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModuleModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      {activeWorkspaceFolder && (
        <FolderWorkspaceModal
          folder={activeWorkspaceFolder}
          onClose={() => setActiveWorkspaceFolder(null)}
          onFolderUpdated={handleRefresh}
        />
      )}

      {searchOpen && (
        <GlobalSearchModal
          folders={folders}
          onClose={() => setSearchOpen(false)}
          onSelectResult={(folder) => {
            setSearchOpen(false);
            setActiveWorkspaceFolder(folder);
          }}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          folders={folders}
          onClose={() => setSettingsOpen(false)}
          onRefresh={handleRefresh}
          onDownloadOfflineApp={handleDownloadOfflineApp}
        />
      )}

      {guideOpen && (
        <Windows11GuideModal 
          onClose={() => setGuideOpen(false)} 
          onDownloadOfflineApp={handleDownloadOfflineApp}
        />
      )}

      {/* Theme Customization Modal (Brown, Gold, Green, White & Combos) */}
      {themeModalOpen && (
        <ThemeSelectorModal
          currentThemeId={currentThemeId}
          onSelectTheme={handleSelectTheme}
          onClose={() => setThemeModalOpen(false)}
        />
      )}

      {/* Cognia AI Audit Diagnostic & Animated Moving Gauge Modal */}
      {cogniaEvaluationOpen && (
        <CogniaEvaluationModal
          folders={folders}
          onClose={() => setCogniaEvaluationOpen(false)}
          onOpenFolderWorkspace={(folder) => {
            setCogniaEvaluationOpen(false);
            setActiveWorkspaceFolder(folder);
          }}
          onViewCogniaPdf={() => {
            setCogniaEvaluationOpen(false);
            setCogniaPdfModalOpen(true);
          }}
        />
      )}

      {/* Official Cognia Standards Resource Cards PDF Modal */}
      {cogniaPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-[1400px] h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-rose-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Cognia Performance Standards Resource Cards
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    K–12 and Postsecondary Institutions (31 Performance Standards & Evidence Catalog)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCogniaPdfModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                title="Close PDF Viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-3 bg-slate-100">
              <PdfViewer 
                file={{
                  id: 'cognia-resource-cards-pdf',
                  folderId: 0,
                  name: 'COGNIA Performance Standards Resource Cards.pdf',
                  size: 217005,
                  type: 'application/pdf',
                  extension: 'pdf',
                  dataUrl: '/assets/aistudio/COGNIA_Performance_Standards_Cards_fc406561.pdf',
                  lastModified: Date.now(),
                  uploadedAt: new Date().toISOString(),
                }} 
                onClose={() => setCogniaPdfModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Windows 11 Confirmation Dialog */}
      <ConfirmModal
        dialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />
    </div>
  );
};
