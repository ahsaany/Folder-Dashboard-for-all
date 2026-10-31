import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Folder, 
  Upload, 
  FolderPlus, 
  Search, 
  Trash2, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  FileCode, 
  File, 
  Plus, 
  Archive, 
  CheckCircle2, 
  Clock, 
  Info,
  Maximize2,
  Minimize2,
  Star,
  CheckSquare,
  Square,
  Edit2,
  Check,
  Palette,
  Music,
  Video,
  FolderTree,
  Filter,
  ChevronRight,
  ArrowLeft,
  ArrowUp,
  LayoutGrid,
  Columns,
  FileCheck,
  HardDrive,
  Eye,
  CornerDownRight,
  Sparkles,
  Mail,
  Layers
} from 'lucide-react';
import { CogniaFolder, FolderFile, FOLDER_COLOR_PALETTE } from '../types';
import { 
  getFilesInFolder, 
  saveMultipleFiles, 
  deleteFile, 
  deleteMultipleFiles, 
  clearFolderFiles, 
  updateFolderRating,
  updateFolderDescription,
  updateFolderColor,
  updateFolderSubfolders
} from '../services/db';
import { exportFolderAsZip, formatBytes } from '../services/exportService';
import { FileViewer } from './FileViewer';
import { ConfirmModal, ConfirmDialogState } from './ConfirmModal';

interface FolderWorkspaceModalProps {
  folder: CogniaFolder;
  onClose: () => void;
  onFolderUpdated: () => void;
}

/**
 * Windows 11 Fluent 3D Folder Graphic
 * Renders large Big Shape folder graphics and medium Average Size icons
 */
const WindowsFolderGraphic: React.FC<{
  size: 'big' | 'average' | 'small';
  color?: string;
  hasItems?: boolean;
}> = ({ size, color = '#FFA000', hasItems = false }) => {
  const uniqueId = useMemo(() => Math.random().toString(36).substr(2, 6), []);

  if (size === 'big') {
    return (
      <div className="relative group/folder drop-shadow-md select-none transition-transform duration-200 group-hover:scale-105">
        <svg
          className="w-20 h-16 sm:w-24 sm:h-18"
          viewBox="0 0 96 74"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`win11-back-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFA000" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>
            <linearGradient id={`win11-front-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD54F" />
              <stop offset="100%" stopColor="#FFB300" />
            </linearGradient>
            <filter id={`win11-shadow-${uniqueId}`} x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.22" />
            </filter>
          </defs>
          {/* Back Plate with Tab */}
          <path
            d="M6 12C6 8.68629 8.68629 6 12 6H36C38 6 40 7.5 42 10L46 15C47.5 16.5 49.5 17 52 17H84C87.3137 17 90 19.6863 90 23V60C90 63.3137 87.3137 66 84 66H12C8.68629 66 6 63.3137 6 60V12Z"
            fill={`url(#win11-back-${uniqueId})`}
          />
          {/* Peeking Document Sheet */}
          <rect x="14" y="14" width="68" height="32" rx="4" fill="#FFFFFF" opacity="0.95" />
          <rect x="20" y="20" width="30" height="3" rx="1.5" fill="#CBD5E1" />
          <rect x="20" y="26" width="44" height="2.5" rx="1" fill="#E2E8F0" />
          <rect x="20" y="31" width="38" height="2.5" rx="1" fill="#E2E8F0" />
          {/* Front Flap */}
          <path
            d="M6 25C6 22.2386 8.23858 20 11 20H85C87.7614 20 90 22.2386 90 25V60C90 64.4183 86.4183 68 82 68H14C9.58172 68 6 64.4183 6 60V25Z"
            fill={`url(#win11-front-${uniqueId})`}
            filter={`url(#win11-shadow-${uniqueId})`}
          />
          {/* Glossy Top Edge Highlight */}
          <path d="M9 22H87" stroke="#FFF9C4" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
        </svg>

        {hasItems && (
          <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    );
  }

  if (size === 'average') {
    return (
      <div className="relative group/folder drop-shadow-xs select-none shrink-0 transition-transform duration-150 group-hover:scale-105">
        <svg
          className="w-11 h-9"
          viewBox="0 0 44 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`win11-avg-b-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFA000" />
              <stop offset="100%" stopColor="#E65100" />
            </linearGradient>
            <linearGradient id={`win11-avg-f-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD54F" />
              <stop offset="100%" stopColor="#FFB300" />
            </linearGradient>
          </defs>
          <path
            d="M3 6C3 4.89543 3.89543 4 5 4H16C17.2 4 18.2 4.8 19 6L20.8 8.4C21.4 9.2 22.4 9.6 23.5 9.6H39C40.1046 9.6 41 10.5 41 11.6V30C41 31.1046 40.1046 32 39 32H5C3.89543 32 3 31.1046 3 30V6Z"
            fill={`url(#win11-avg-b-${uniqueId})`}
          />
          <rect x="7" y="7" width="30" height="15" rx="2" fill="#FFFFFF" opacity="0.9" />
          <path
            d="M3 13C3 11.8954 3.89543 11 5 11H39C40.1046 11 41 11.8954 41 13V30C41 32.2091 39.2091 34 37 34H7C4.79086 34 3 32.2091 3 30V13Z"
            fill={`url(#win11-avg-f-${uniqueId})`}
          />
          <path d="M5 12.5H39" stroke="#FFE082" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        </svg>

        {hasItems && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-600 rounded-full ring-1 ring-white" />
        )}
      </div>
    );
  }

  // Small inline icon
  return (
    <svg className="w-5 h-5 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
    </svg>
  );
};

export const FolderWorkspaceModal: React.FC<FolderWorkspaceModalProps> = ({
  folder,
  onClose,
  onFolderUpdated,
}) => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [files, setFiles] = useState<FolderFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isFullWindow, setIsFullWindow] = useState<boolean>(false);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Layout View Switcher: 'split' | 'explorer' | 'reader'
  const [viewLayout, setViewLayout] = useState<'split' | 'explorer' | 'reader'>('split');

  // 'Select Multiple' Mode State
  const [isSelectMultipleMode, setIsSelectMultipleMode] = useState<boolean>(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Windows 11 Breadcrumbs & Path Navigation State
  // Empty array [] indicates Root of this module (Windows Drive level)
  // ['Term 1'] indicates inside top-level folder 'Term 1'
  // ['Term 1', 'Physics'] indicates nested subfolder
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [showAllFlatFiles, setShowAllFlatFiles] = useState<boolean>(false);

  // Subfolder creation dialog state
  const [isCreatingSubfolder, setIsCreatingSubfolder] = useState<boolean>(false);
  const [newSubfolderName, setNewSubfolderName] = useState<string>('');

  // Editable Description State
  const [isEditingDescription, setIsEditingDescription] = useState<boolean>(false);
  const [editedDescription, setEditedDescription] = useState<string>(folder.description);

  // Folder Color Picker State
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>(folder.color || '#1B5E20');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const currentRating = folder.rating !== undefined ? folder.rating : (files.length > 0 ? 4 : 0);

  const loadFiles = async () => {
    setLoading(true);
    const loaded = await getFilesInFolder(folder.id);
    setFiles(loaded);
    if (loaded.length > 0 && !selectedFileId) {
      setSelectedFileId(loaded[0].id);
    } else if (loaded.length === 0) {
      setSelectedFileId(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
    setEditedDescription(folder.description);
    setCurrentColor(folder.color || '#1B5E20');
  }, [folder.id]);

  const handleSetRating = async (ratingVal: number) => {
    await updateFolderRating(folder.id, ratingVal);
    folder.rating = ratingVal;
    onFolderUpdated();
  };

  const handleSaveDescription = async () => {
    if (editedDescription.trim()) {
      await updateFolderDescription(folder.id, editedDescription.trim());
      folder.description = editedDescription.trim();
      onFolderUpdated();
    }
    setIsEditingDescription(false);
  };

  const handleChangeColor = async (hex: string) => {
    await updateFolderColor(folder.id, hex);
    setCurrentColor(hex);
    folder.color = hex;
    setShowColorPicker(false);
    onFolderUpdated();
  };

  // Normalize subfolder paths (handle both '/' and ' / ')
  const normalizePath = (pathStr: string) =>
    pathStr
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean)
      .join('/');

  // All registered subfolders from folder metadata + file relative paths
  const allKnownSubfolderPaths = useMemo(() => {
    const set = new Set<string>();
    (folder.subfolders || []).forEach((sf) => {
      const norm = normalizePath(sf);
      if (norm) set.add(norm);
    });
    files.forEach((f) => {
      if (f.subfolder) {
        const norm = normalizePath(f.subfolder);
        if (norm) set.add(norm);
      }
    });
    return Array.from(set);
  }, [folder.subfolders, files]);

  // Current subfolder path string
  const currentPathString = currentPath.join('/');

  // Direct child folders at the active navigation level
  const directChildFolders = useMemo(() => {
    const childSet = new Map<
      string,
      {
        folderName: string;
        fullPath: string;
        fileCount: number;
        totalSize: number;
        nestedFolderCount: number;
      }
    >();

    const targetDepth = currentPath.length; // 0 for root, 1 for depth 1, etc.

    allKnownSubfolderPaths.forEach((sf) => {
      const segments = sf.split('/').map((s) => s.trim()).filter(Boolean);

      // Check if this subfolder is inside currentPath
      let isChild = true;
      for (let i = 0; i < targetDepth; i++) {
        if (segments[i] !== currentPath[i]) {
          isChild = false;
          break;
        }
      }

      if (isChild && segments.length > targetDepth) {
        const childName = segments[targetDepth];
        const childFullPath = currentPath.length > 0 ? `${currentPathString}/${childName}` : childName;

        if (!childSet.has(childName)) {
          // Calculate files inside this child folder (including nested)
          const matchingFiles = files.filter((f) => {
            if (!f.subfolder) return false;
            const fNorm = normalizePath(f.subfolder);
            return fNorm === childFullPath || fNorm.startsWith(`${childFullPath}/`);
          });

          // Check if there are deeper nested subfolders
          const nestedFolders = allKnownSubfolderPaths.filter((path) =>
            path.startsWith(`${childFullPath}/`)
          );

          childSet.set(childName, {
            folderName: childName,
            fullPath: childFullPath,
            fileCount: matchingFiles.length,
            totalSize: matchingFiles.reduce((acc, f) => acc + f.size, 0),
            nestedFolderCount: nestedFolders.length,
          });
        }
      }
    });

    return Array.from(childSet.values()).sort((a, b) => a.folderName.localeCompare(b.folderName));
  }, [allKnownSubfolderPaths, currentPath, currentPathString, files]);

  // Files at current navigation level (or all files if flat view is on)
  const filesAtCurrentLevel = useMemo(() => {
    if (showAllFlatFiles) return files;

    return files.filter((file) => {
      const fileSub = file.subfolder ? normalizePath(file.subfolder) : '';
      if (currentPath.length === 0) {
        return !fileSub || fileSub === 'root';
      }
      return fileSub === currentPathString;
    });
  }, [files, currentPath, currentPathString, showAllFlatFiles]);

  // Filtered files according to search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return filesAtCurrentLevel;
    const query = searchQuery.toLowerCase();
    return filesAtCurrentLevel.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        (f.subfolder && f.subfolder.toLowerCase().includes(query)) ||
        f.extension.toLowerCase().includes(query)
    );
  }, [filesAtCurrentLevel, searchQuery]);

  // Create subfolder at current location
  const handleCreateSubfolder = async () => {
    const trimmed = newSubfolderName.trim();
    if (!trimmed) return;

    const fullNewPath = currentPath.length > 0 ? `${currentPathString}/${trimmed}` : trimmed;
    const updated = Array.from(new Set([...(folder.subfolders || []), fullNewPath]));

    await updateFolderSubfolders(folder.id, updated);
    folder.subfolders = updated;

    // Automatically navigate into the newly created folder
    setCurrentPath(fullNewPath.split('/'));
    setNewSubfolderName('');
    setIsCreatingSubfolder(false);
    onFolderUpdated();
  };

  // Delete subfolder and all its nested files
  const handleDeleteSubfolder = (fullSubfolderPath: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const folderName = fullSubfolderPath.split('/').pop() || fullSubfolderPath;

    // Find all files belonging to this subfolder or its children
    const filesToDelete = files.filter((f) => {
      if (!f.subfolder) return false;
      const fNorm = normalizePath(f.subfolder);
      return fNorm === fullSubfolderPath || fNorm.startsWith(`${fullSubfolderPath}/`);
    });

    setConfirmDialog({
      isOpen: true,
      title: `Delete Folder "${folderName}"?`,
      message: `Are you sure you want to delete this folder and all ${filesToDelete.length} evidence files inside it? This operation is permanent in local storage.`,
      confirmLabel: 'Delete Folder & Files',
      isDestructive: true,
      onConfirm: async () => {
        // Delete files
        if (filesToDelete.length > 0) {
          const ids = filesToDelete.map((f) => f.id);
          await deleteMultipleFiles(ids);
        }

        // Update subfolder metadata
        const updated = (folder.subfolders || []).filter(
          (sf) => normalizePath(sf) !== fullSubfolderPath && !normalizePath(sf).startsWith(`${fullSubfolderPath}/`)
        );
        await updateFolderSubfolders(folder.id, updated);
        folder.subfolders = updated;

        // If currently inside this subfolder, navigate up
        if (currentPathString === fullSubfolderPath || currentPathString.startsWith(`${fullSubfolderPath}/`)) {
          setCurrentPath(currentPath.slice(0, -1));
        }

        await loadFiles();
        onFolderUpdated();
      },
    });
  };

  // Upload file handler (supports audio, video, images, PDFs, docs, spreadsheets)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = event.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    const newFiles: FolderFile[] = [];
    const detectedSubfolders: string[] = [];
    const total = rawFiles.length;

    for (let i = 0; i < total; i++) {
      const file = rawFiles[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const uniqueId = `f${folder.id}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Determine subfolder:
      let subfolderName: string | undefined = undefined;
      const relPath = (file as any).webkitRelativePath;

      if (relPath && relPath.includes('/')) {
        const parts = relPath.split('/');
        if (parts.length > 2) {
          // e.g. "Root/SubfolderName/filename.ext" -> "SubfolderName"
          const intermediate = parts.slice(1, parts.length - 1).join('/');
          subfolderName = currentPath.length > 0 ? `${currentPathString}/${intermediate}` : intermediate;
          if (subfolderName) {
            detectedSubfolders.push(subfolderName);
          }
        } else if (parts.length === 2 && currentPath.length > 0) {
          subfolderName = currentPathString;
        }
      } else if (currentPath.length > 0) {
        subfolderName = currentPathString;
      }

      newFiles.push({
        id: uniqueId,
        folderId: folder.id,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        extension: ext,
        blob: file,
        lastModified: file.lastModified,
        uploadedAt: new Date().toISOString(),
        relativePath: relPath || file.name,
        subfolder: subfolderName,
      });

      setUploadProgress(Math.round(((i + 1) / total) * 90));
    }

    // Save any newly detected subfolders to folder metadata
    if (detectedSubfolders.length > 0) {
      const updatedSubfolders = Array.from(new Set([...(folder.subfolders || []), ...detectedSubfolders]));
      await updateFolderSubfolders(folder.id, updatedSubfolders);
      folder.subfolders = updatedSubfolders;
    }

    await saveMultipleFiles(newFiles);
    setUploadProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 450);

    await loadFiles();
    onFolderUpdated();

    if (newFiles.length > 0) {
      setSelectedFileId(newFiles[0].id);
    }

    if (event.target) event.target.value = '';
  };

  // Single file deletion
  const handleDeleteFile = (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const targetFile = files.find((f) => f.id === fileId);
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Evidence File',
      message: `Are you sure you want to remove "${targetFile?.name || 'this file'}" from ${folder.name}? This removes it from local offline storage.`,
      confirmLabel: 'Remove File',
      isDestructive: true,
      onConfirm: async () => {
        await deleteFile(fileId);
        if (selectedFileId === fileId) {
          const remaining = files.filter((f) => f.id !== fileId);
          setSelectedFileId(remaining.length > 0 ? remaining[0].id : null);
        }
        if (selectedFileIds.has(fileId)) {
          const updated = new Set(selectedFileIds);
          updated.delete(fileId);
          setSelectedFileIds(updated);
        }
        await loadFiles();
        onFolderUpdated();
      },
    });
  };

  // Toggle selection of single file in 'Select Multiple' mode
  const handleToggleSelectFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = new Set(selectedFileIds);
    if (updated.has(fileId)) {
      updated.delete(fileId);
    } else {
      updated.add(fileId);
    }
    setSelectedFileIds(updated);
  };

  // Toggle select all in current filtered view
  const handleToggleSelectAll = () => {
    if (selectedFileIds.size === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedFileIds(new Set());
    } else {
      const allIds = new Set(filteredFiles.map((f) => f.id));
      setSelectedFileIds(allIds);
    }
  };

  // Bulk delete selected multiple files
  const handleDeleteSelectedMultiple = () => {
    if (selectedFileIds.size === 0) return;
    const count = selectedFileIds.size;
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${count} Selected Evidence Files?`,
      message: `Are you sure you want to permanently delete these ${count} files from ${folder.name}? This operation cannot be undone.`,
      confirmLabel: `Delete ${count} Files`,
      isDestructive: true,
      onConfirm: async () => {
        const idsToDelete = Array.from(selectedFileIds);
        await deleteMultipleFiles(idsToDelete);

        if (selectedFileId && selectedFileIds.has(selectedFileId)) {
          const remaining = files.filter((f) => !selectedFileIds.has(f.id));
          setSelectedFileId(remaining.length > 0 ? remaining[0].id : null);
        }

        setSelectedFileIds(new Set());
        setIsSelectMultipleMode(false);
        await loadFiles();
        onFolderUpdated();
      },
    });
  };

  // Clear all files in folder
  const handleClearFolder = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Clear Entire Folder: ${folder.name}?`,
      message: `Are you sure you want to delete ALL ${files.length} evidence documents and subfolder structures inside this module?`,
      confirmLabel: 'Clear All Files',
      isDestructive: true,
      onConfirm: async () => {
        await clearFolderFiles(folder.id);
        await updateFolderSubfolders(folder.id, []);
        folder.subfolders = [];
        setSelectedFileId(null);
        setSelectedFileIds(new Set());
        setCurrentPath([]);
        await loadFiles();
        onFolderUpdated();
      },
    });
  };

  // Export as ZIP archive
  const handleExportZip = async () => {
    try {
      await exportFolderAsZip(folder, files);
    } catch (err) {
      console.error('Failed to export folder ZIP:', err);
    }
  };

  const selectedFile = files.find((f) => f.id === selectedFileId) || null;

  // File type icons helper
  const getFileIcon = (ext: string) => {
    const cleanExt = ext.toLowerCase();
    switch (cleanExt) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'svg':
      case 'webp':
      case 'gif':
        return <FileImage className="w-5 h-5 text-purple-600 shrink-0" />;
      case 'mp4':
      case 'mkv':
      case 'mov':
      case 'webm':
      case 'avi':
        return <Video className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'm4a':
      case 'aac':
        return <Music className="w-5 h-5 text-indigo-600 shrink-0" />;
      case 'json':
      case 'html':
      case 'css':
      case 'js':
        return <FileCode className="w-5 h-5 text-cyan-600 shrink-0" />;
      case 'eml':
      case 'msg':
      case 'pst':
        return <Mail className="w-5 h-5 text-[#0078D4] shrink-0" />;
      case 'psd':
        return <Layers className="w-5 h-5 text-[#31a8ff] shrink-0" />;
      default:
        return <File className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  // Is current view at Root of this Module?
  const isAtRoot = currentPath.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className={`bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullWindow ? 'w-full h-full rounded-none' : 'w-full max-w-[1580px] h-[92vh]'
        }`}
      >
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory="true"
          directory="true"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Windows 11 Fluent Title Bar */}
        <div className="px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl shadow-xs flex items-center justify-center text-white"
              style={{ backgroundColor: currentColor }}
            >
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  Module {folder.id < 10 ? `0${folder.id}` : folder.id}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {folder.name}
                </h3>
              </div>

              {/* Rating Stars & Storage Capacity */}
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <div className="flex items-center gap-1.5 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60">
                  <span className="text-[11px] font-semibold text-amber-900">Rating:</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleSetRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 text-amber-400 hover:text-amber-500 transition-colors"
                        title={`Rate Evidence: ${star} of 5 Stars`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            star <= (hoverRating || currentRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md">
                  <HardDrive className="w-3 h-3 text-slate-500" />
                  <span>Storage: {formatBytes(folder.totalSize)}</span>
                  <span>({files.length} files)</span>
                </div>

                {/* Color Customization Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="p-1 hover:bg-slate-200/80 rounded-md transition-colors flex items-center gap-1 text-[11px] text-slate-600"
                    title="Change folder theme color"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: currentColor }}
                    />
                    <Palette className="w-3 h-3 text-slate-400" />
                  </button>

                  {showColorPicker && (
                    <div className="absolute left-0 top-full mt-1 z-50 p-2 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-wrap gap-1.5 w-48 animate-in fade-in zoom-in-95">
                      {FOLDER_COLOR_PALETTE.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => handleChangeColor(c.hex)}
                          className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center hover:scale-115 transition-transform shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {currentColor === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Toggle & Window Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setViewLayout('explorer')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  viewLayout === 'explorer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
                title="Windows Drive Explorer (Big & Medium Folder Icons)"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-amber-600" />
                <span>Drive Explorer</span>
              </button>
              <button
                onClick={() => setViewLayout('split')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  viewLayout === 'split'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
                title="Split View (Explorer + Live File/PDF Reader)"
              >
                <Columns className="w-3.5 h-3.5 text-emerald-700" />
                <span>Split View</span>
              </button>
              <button
                onClick={() => setViewLayout('reader')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  viewLayout === 'reader'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
                title="Document Reader Only"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Document View</span>
              </button>
            </div>

            <button
              onClick={() => setShowGuidelines(!showGuidelines)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showGuidelines
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Cognia Standard Guidelines"
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Evidence Criteria</span>
            </button>

            {files.length > 0 && (
              <button
                onClick={handleExportZip}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors shadow-xs"
                title="Download Folder as ZIP"
              >
                <Archive className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden md:inline">Export ZIP</span>
              </button>
            )}

            <button
              onClick={() => setIsFullWindow(!isFullWindow)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title={isFullWindow ? 'Restore Size' : 'Maximize Workspace'}
            >
              {isFullWindow ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
              title="Close Workspace (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editable Description Bar under Heading */}
        <div className="px-5 py-2 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex-1 mr-4">
            {isEditingDescription ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveDescription();
                    if (e.key === 'Escape') setIsEditingDescription(false);
                  }}
                  autoFocus
                  placeholder="Enter module description..."
                  className="flex-1 px-2.5 py-1 text-xs bg-white border border-emerald-600 rounded-md text-slate-800 focus:outline-hidden"
                />
                <button
                  onClick={handleSaveDescription}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditingDescription(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 group/desc cursor-pointer"
                onClick={() => setIsEditingDescription(true)}
              >
                <span className="font-semibold text-slate-700 shrink-0">Description:</span>
                <p className="text-slate-600 line-clamp-1 italic">
                  {folder.description || 'No description provided.'}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingDescription(true);
                  }}
                  className="opacity-0 group-hover/desc:opacity-100 p-1 text-slate-400 hover:text-emerald-700 transition-opacity"
                  title="Edit Description"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsEditingDescription(!isEditingDescription)}
            className="text-[11px] text-emerald-800 hover:underline font-medium shrink-0 flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" />
            <span>{isEditingDescription ? 'Close Editor' : 'Edit Description'}</span>
          </button>
        </div>

        {/* Windows 11 Explorer Navigation & Breadcrumbs Bar */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          {/* Breadcrumb Path & History Navigation */}
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Back Button */}
            <button
              onClick={() => setCurrentPath((prev) => prev.slice(0, -1))}
              disabled={isAtRoot}
              className={`p-1.5 rounded-lg transition-colors ${
                isAtRoot
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95'
              }`}
              title="Go Back / Up One Level"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Up to Parent Button */}
            <button
              onClick={() => setCurrentPath([])}
              disabled={isAtRoot}
              className={`p-1.5 rounded-lg transition-colors ${
                isAtRoot
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95'
              }`}
              title="Go to Module Root"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            {/* Windows 11 Address Bar Pill Box */}
            <div className="flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-200/90 rounded-lg text-xs text-slate-700 overflow-x-auto max-w-xl">
              <button
                onClick={() => {
                  setCurrentPath([]);
                  setShowAllFlatFiles(false);
                }}
                className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md transition-colors font-medium shrink-0 ${
                  isAtRoot && !showAllFlatFiles
                    ? 'bg-amber-100 text-amber-900 font-bold'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
                title="Root Drive (Module)"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                <span>{folder.name}</span>
              </button>

              {currentPath.map((seg, idx) => {
                const isLast = idx === currentPath.length - 1;
                return (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <button
                      onClick={() => {
                        setCurrentPath(currentPath.slice(0, idx + 1));
                        setShowAllFlatFiles(false);
                      }}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors shrink-0 ${
                        isLast && !showAllFlatFiles
                          ? 'bg-amber-100 text-amber-900 font-bold'
                          : 'hover:bg-slate-200 text-slate-700 font-medium'
                      }`}
                    >
                      <Folder className="w-3 h-3 text-amber-500" />
                      <span>{seg}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* All Files View Toggle */}
            <button
              onClick={() => setShowAllFlatFiles(!showAllFlatFiles)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors shrink-0 ${
                showAllFlatFiles
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Show all evidence files in this module flat list"
            >
              All Evidence ({files.length})
            </button>
          </div>

          {/* Action Ribbon: New Folder, Upload Folder, Add Files */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingSubfolder(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-2xs active:scale-95"
              title={
                isAtRoot
                  ? 'Create New Top-Level Folder (Big Shape)'
                  : `Create New Subfolder inside "${currentPath[currentPath.length - 1]}"`
              }
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-700" />
              <span>{isAtRoot ? '+ New Folder' : '+ New Subfolder'}</span>
            </button>

            <button
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
              title="Upload entire local folder directory into this location"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Folder</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold transition-all active:scale-95"
              title="Add individual files to current folder"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Add Files</span>
            </button>
          </div>
        </div>

        {/* Subfolder Creation Inline Box */}
        {isCreatingSubfolder && (
          <div className="px-5 py-3 bg-amber-50/90 border-b border-amber-200 flex items-center justify-between gap-4 animate-in slide-in-from-top duration-150">
            <div className="flex items-center gap-3 flex-1 max-w-lg">
              <FolderPlus className="w-5 h-5 text-amber-700 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-950 mb-1">
                  {isAtRoot
                    ? 'Create New Top-Level Folder (Big Windows Shape):'
                    : `Create Subfolder inside "${currentPath[currentPath.length - 1]}" (Average Size):`}
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter folder name (e.g. Term 1, Science Labs, Audits)..."
                    value={newSubfolderName}
                    onChange={(e) => setNewSubfolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateSubfolder();
                      if (e.key === 'Escape') setIsCreatingSubfolder(false);
                    }}
                    autoFocus
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-400 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                  />
                  <button
                    onClick={handleCreateSubfolder}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingSubfolder(false);
                      setNewSubfolderName('');
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-amber-100 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Uploading Banner */}
        {isUploading && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2 font-medium">
              <Upload className="w-4 h-4 text-emerald-700 animate-bounce" />
              <span>Importing files into offline database storage...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-40 h-2 bg-emerald-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-700 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="font-mono tabular-nums font-semibold">{uploadProgress}%</span>
            </div>
          </div>
        )}

        {/* Guidelines Drawer */}
        {showGuidelines && (
          <div className="px-5 py-3.5 bg-amber-50/90 border-b border-amber-200 text-xs text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-amber-900">Cognia Accreditation Standard Overview:</p>
              <p className="text-amber-800 leading-relaxed">{folder.description}</p>
            </div>
            <div className="shrink-0 bg-white/80 p-2.5 rounded-lg border border-amber-200 max-w-md">
              <p className="font-semibold text-slate-800 mb-1">Key Evidence Artifacts to Upload:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {folder.suggestedEvidences.map((item, idx) => (
                  <li key={idx} className="truncate">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Main Body Area: Dynamic Layout based on viewLayout ('split', 'explorer', 'reader') */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel (or Full Panel in Explorer Mode) */}
          {(viewLayout === 'split' || viewLayout === 'explorer') && (
            <div
              className={`flex flex-col bg-slate-50/60 overflow-hidden ${
                viewLayout === 'explorer'
                  ? 'w-full'
                  : 'w-full md:w-[480px] lg:w-[540px] xl:w-[600px] border-r border-slate-200 shrink-0'
              }`}
            >
              {/* Search & Bulk Multi-Select Ribbon */}
              <div className="p-3 border-b border-slate-200 bg-white/70 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={
                      showAllFlatFiles
                        ? 'Search all evidence files...'
                        : isAtRoot
                        ? 'Search root files & folders...'
                        : `Search inside "${currentPath[currentPath.length - 1]}"...`
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white text-slate-800 transition-colors"
                  />
                </div>

                <button
                  onClick={() => {
                    if (isSelectMultipleMode) {
                      setSelectedFileIds(new Set());
                      setIsSelectMultipleMode(false);
                    } else {
                      setIsSelectMultipleMode(true);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all shrink-0 ${
                    isSelectMultipleMode
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title={isSelectMultipleMode ? 'Cancel Multi-Select' : 'Select Multiple Files to Bulk Delete'}
                >
                  {isSelectMultipleMode ? 'Cancel' : 'Select Multiple'}
                </button>
              </div>

              {/* Multi-Select Action Ribbon */}
              {isSelectMultipleMode && (
                <div className="p-2.5 bg-amber-50/90 border-b border-amber-200 flex items-center justify-between text-xs animate-in fade-in shrink-0">
                  <button
                    onClick={handleToggleSelectAll}
                    className="flex items-center gap-1.5 text-amber-900 font-semibold hover:underline"
                  >
                    {selectedFileIds.size === filteredFiles.length && filteredFiles.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>
                      {selectedFileIds.size === filteredFiles.length ? 'Deselect All' : 'Select All'}
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-amber-950">
                      {selectedFileIds.size} selected
                    </span>

                    <button
                      onClick={handleDeleteSelectedMultiple}
                      disabled={selectedFileIds.size === 0}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                        selectedFileIds.size > 0
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete ({selectedFileIds.size})</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Scrollable Explorer Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* 1. SUBFOLDERS SECTION */}
                {!showAllFlatFiles && directChildFolders.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          {isAtRoot ? 'Folders in this Module' : 'Subfolders'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {directChildFolders.length}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 italic">
                        {isAtRoot ? 'Click to open drive folder' : 'Average size subfolder'}
                      </span>
                    </div>

                    {/* FOLDER TILES: BIG SHAPE (Level 0 / Root) OR AVERAGE SIZE (Level >= 1) */}
                    {isAtRoot ? (
                      /* BIG SHAPE FOLDER TILES (Windows Drive Style) */
                      <div
                        className={`grid gap-3.5 ${
                          viewLayout === 'explorer'
                            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                            : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
                        }`}
                      >
                        {directChildFolders.map((childFolder) => (
                          <motion.div
                            key={childFolder.fullPath}
                            initial={{ opacity: 0, y: 12, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            whileHover={{ y: -4, transition: { duration: 0.18 } }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCurrentPath(childFolder.fullPath.split('/'))}
                            className="group relative flex flex-col items-center justify-between p-4 rounded-2xl bg-gradient-to-b from-white via-white to-amber-50/30 border border-slate-200/90 hover:border-amber-400 hover:ring-2 hover:ring-amber-400/25 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[160px] text-center"
                          >
                            {/* Top Badges & Actions */}
                            <div className="w-full flex items-center justify-between">
                              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200/80">
                                Folder
                              </span>
                              <button
                                onClick={(e) => handleDeleteSubfolder(childFolder.fullPath, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title={`Delete folder "${childFolder.folderName}"`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Big Windows 11 3D Folder Graphic */}
                            <div className="my-1 flex items-center justify-center">
                              <WindowsFolderGraphic
                                size="big"
                                color={currentColor}
                                hasItems={childFolder.fileCount > 0}
                              />
                            </div>

                            {/* Folder Title & Metadata */}
                            <div className="w-full">
                              <h5
                                className="text-xs font-extrabold text-slate-900 group-hover:text-amber-900 truncate px-1"
                                title={childFolder.folderName}
                              >
                                {childFolder.folderName}
                              </h5>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {childFolder.fileCount}{' '}
                                {childFolder.fileCount === 1 ? 'file' : 'files'}{' '}
                                {childFolder.totalSize > 0 && `· ${formatBytes(childFolder.totalSize)}`}
                              </p>
                              {childFolder.nestedFolderCount > 0 && (
                                <span className="text-[9px] font-semibold text-emerald-700 block mt-0.5">
                                  {childFolder.nestedFolderCount} nested subfolder
                                  {childFolder.nestedFolderCount > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      /* AVERAGE SIZE FOLDER TILES (Windows Medium Tile Style) */
                      <div
                        className={`grid gap-2.5 ${
                          viewLayout === 'explorer'
                            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                            : 'grid-cols-1 sm:grid-cols-2'
                        }`}
                      >
                        {directChildFolders.map((childFolder) => (
                          <motion.div
                            key={childFolder.fullPath}
                            initial={{ opacity: 0, y: 8, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            whileHover={{ y: -2, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setCurrentPath(childFolder.fullPath.split('/'))}
                            className="group relative flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/90 hover:border-amber-400 hover:ring-2 hover:ring-amber-400/20 shadow-2xs hover:shadow-md transition-all cursor-pointer min-h-[76px]"
                          >
                            <WindowsFolderGraphic
                              size="average"
                              color={currentColor}
                              hasItems={childFolder.fileCount > 0}
                            />
                            <div className="min-w-0 flex-1">
                              <h5
                                className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate"
                                title={childFolder.folderName}
                              >
                                {childFolder.folderName}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {childFolder.fileCount}{' '}
                                {childFolder.fileCount === 1 ? 'file' : 'files'}{' '}
                                {childFolder.totalSize > 0 && `· ${formatBytes(childFolder.totalSize)}`}
                              </p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteSubfolder(childFolder.fullPath, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0"
                              title={`Delete folder "${childFolder.folderName}"`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. FILES SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {showAllFlatFiles
                          ? 'All Evidence Files'
                          : isAtRoot
                          ? 'Files at Root Level'
                          : `Files in "${currentPath[currentPath.length - 1]}"`}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {filteredFiles.length}
                      </span>
                    </div>
                    {filteredFiles.length > 0 && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatBytes(filteredFiles.reduce((acc, f) => acc + f.size, 0))}
                      </span>
                    )}
                  </div>

                  {filteredFiles.length === 0 ? (
                    <div className="p-8 text-center bg-white/70 rounded-2xl border border-dashed border-slate-200">
                      <Folder className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-[1.2]" />
                      <p className="text-xs font-semibold text-slate-700">No files in this folder</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                        Use "Add Files" or "Upload Folder" above to save PDFs, reports, images, or media
                        here.
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 shadow-xs"
                        >
                          + Add Files Here
                        </button>
                      </div>
                    </div>
                  ) : viewLayout === 'explorer' ? (
                    /* Widescreen Explorer Grid for Files */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {filteredFiles.map((file) => {
                        const isSelected = file.id === selectedFileId;
                        const isChecked = selectedFileIds.has(file.id);

                        return (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -2 }}
                            onClick={() => {
                              setSelectedFileId(file.id);
                              setViewLayout('split');
                            }}
                            className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/30 shadow-xs'
                                : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-300 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              {isSelectMultipleMode ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleSelectFile(file.id, e)}
                                  className="p-0.5 text-amber-600"
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-amber-600" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                              ) : (
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                                  {getFileIcon(file.extension)}
                                </div>
                              )}

                              {!isSelectMultipleMode && (
                                <button
                                  onClick={(e) => handleDeleteFile(file.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                  title="Delete file"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="mt-2 min-w-0">
                              <p
                                className="text-xs font-semibold text-slate-900 group-hover:text-emerald-900 truncate"
                                title={file.name}
                              >
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {formatBytes(file.size)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Compact List View for Split Mode */
                    <div className="bg-white rounded-xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-2xs">
                      {filteredFiles.map((file) => {
                        const isSelected = file.id === selectedFileId;
                        const isChecked = selectedFileIds.has(file.id);

                        return (
                          <div
                            key={file.id}
                            onClick={() => setSelectedFileId(file.id)}
                            className={`group flex items-center justify-between p-2.5 transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50/80 border-l-4 border-l-emerald-700'
                                : 'hover:bg-slate-50/90'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              {isSelectMultipleMode ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleSelectFile(file.id, e)}
                                  className="p-1 text-amber-600 hover:text-amber-700"
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-4 h-4 text-amber-600" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                              ) : (
                                <div className="shrink-0 p-1 rounded-md bg-slate-50 border border-slate-200/80">
                                  {getFileIcon(file.extension)}
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-xs font-semibold truncate ${
                                    isSelected ? 'text-emerald-950' : 'text-slate-800'
                                  }`}
                                  title={file.name}
                                >
                                  {file.name}
                                </p>
                                <div className="text-[10px] text-slate-400 font-mono tabular-nums flex items-center gap-1.5 mt-0.5">
                                  {showAllFlatFiles && file.subfolder && (
                                    <>
                                      <span className="text-amber-800 font-semibold truncate max-w-[120px]">
                                        📁 {file.subfolder}
                                      </span>
                                      <span>·</span>
                                    </>
                                  )}
                                  <span>{formatBytes(file.size)}</span>
                                  <span>·</span>
                                  <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {!isSelectMultipleMode && (
                              <button
                                onClick={(e) => handleDeleteFile(file.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all shrink-0 ml-2"
                                title="Delete file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Panel Footer Summary */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <span className="font-mono tabular-nums">
                  {files.length} {files.length === 1 ? 'file' : 'files'} · Total Storage:{' '}
                  {formatBytes(folder.totalSize)}
                </span>
                {files.length > 0 && (
                  <button
                    onClick={handleClearFolder}
                    className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Panel: Integrated File & PDF Viewer (Visible in Split or Reader Mode) */}
          {(viewLayout === 'split' || viewLayout === 'reader') && (
            <div className="flex-1 p-3 md:p-4 bg-slate-100/70 overflow-hidden flex flex-col">
              <FileViewer file={selectedFile} folderName={folder.name} />
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmModal dialog={confirmDialog} onClose={() => setConfirmDialog(null)} />
    </div>
  );
};
