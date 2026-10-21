import React, { useRef, useState } from 'react';
import { 
  Folder, 
  FolderCheck, 
  Upload, 
  FolderPlus, 
  Eye, 
  Edit3, 
  Trash2, 
  FileText, 
  Clock, 
  Check, 
  X,
  FileCheck2,
  HardDrive
} from 'lucide-react';
import { CogniaFolder, FolderFile } from '../types';
import { saveMultipleFiles, updateFolderMetadata, clearFolderFiles } from '../services/db';
import { formatBytes } from '../services/exportService';

interface FolderCardProps {
  folder: CogniaFolder;
  onOpenWorkspace: (folder: CogniaFolder) => void;
  onRefresh: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onOpenWorkspace,
  onRefresh,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(folder.name);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);

  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isPopulated = folder.fileCount > 0;

  // Handle Directory Upload via webkitdirectory
  const handleDirectoryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = event.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    await processFiles(rawFiles);
    if (event.target) event.target.value = '';
  };

  const processFiles = async (fileList: FileList | File[]) => {
    setIsUploading(true);
    setUploadPercent(10);

    const newFiles: FolderFile[] = [];
    const total = fileList.length;

    for (let i = 0; i < total; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const uniqueId = `f${folder.id}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

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
        relativePath: (file as any).webkitRelativePath || file.name,
      });

      setUploadPercent(Math.round(((i + 1) / total) * 90));
    }

    await saveMultipleFiles(newFiles);
    setUploadPercent(100);

    setTimeout(() => {
      setIsUploading(false);
      setUploadPercent(0);
      onRefresh();
    }, 400);
  };

  // Drag and drop support directly on card
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleSaveName = async () => {
    if (editedName.trim() && editedName !== folder.name) {
      await updateFolderMetadata({
        ...folder,
        name: editedName.trim(),
      });
      onRefresh();
    }
    setIsEditingName(false);
  };

  const handleClear = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Clear all ${folder.fileCount} evidence files from "${folder.name}"?`)) {
      await clearFolderFiles(folder.id);
      onRefresh();
    }
  };

  // Estimate completion progress indicator
  // A standard Cognia folder is considered fully documented if it has >= 2 key evidence documents
  const targetFiles = 2;
  const progressRatio = Math.min(folder.fileCount / targetFiles, 1);
  const progressPercent = Math.round(progressRatio * 100);

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'Leadership Capacity':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'Learning Capacity':
        return 'text-green-800 bg-green-50 border-green-200';
      case 'Resource Capacity':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Accreditation Exhibits':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col bg-white/90 backdrop-blur-md rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
        isDraggingOver
          ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/50'
          : isPopulated
          ? 'border-emerald-200/90'
          : 'border-slate-200/90'
      }`}
    >
      {/* Hidden File Inputs */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
        onChange={handleDirectoryUpload}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleDirectoryUpload}
      />

      {/* Uploading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-4">
          <Upload className="w-6 h-6 text-emerald-700 animate-bounce mb-2" />
          <span className="text-xs font-semibold text-slate-800">Importing Evidence...</span>
          <div className="w-full max-w-[160px] h-2 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200">
            <div
              className="h-full bg-emerald-700 transition-all duration-150"
              style={{ width: `${uploadPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono tabular-nums text-slate-500 mt-1">{uploadPercent}%</span>
        </div>
      )}

      {/* Top Card Bar: Number Badge, Domain, Status */}
      <div className="p-4 pb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Windows 11 Folder Number Tag */}
          <div className="w-7 h-7 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-xs font-mono shadow-2xs shrink-0">
            {String(folder.id).padStart(2, '0')}
          </div>
          <div>
            <div className="text-[11px] font-mono font-semibold text-slate-500">
              {folder.standardCode}
            </div>
            <div className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${getDomainColor(folder.domain)}`}>
              {folder.domain}
            </div>
          </div>
        </div>

        {/* Status Badge: Empty vs Populated */}
        <div className="shrink-0 text-right">
          {isPopulated ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/90 text-emerald-800 border border-emerald-300">
              <Check className="w-3 h-3 text-emerald-700" />
              <span>{folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <span>Empty</span>
            </span>
          )}
        </div>
      </div>

      {/* Folder Name & Description */}
      <div className="px-4 flex-1">
        {isEditingName ? (
          <div className="flex items-center gap-1.5 my-1">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveName();
                if (e.key === 'Escape') setIsEditingName(false);
              }}
              autoFocus
              className="flex-1 text-sm font-semibold px-2 py-1 bg-white border border-emerald-600 rounded-md focus:outline-hidden text-slate-800"
            />
            <button
              onClick={handleSaveName}
              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
              title="Save name"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditingName(false)}
              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-1 group/name">
            <h3
              onClick={() => onOpenWorkspace(folder)}
              className="font-bold text-sm text-slate-900 group-hover:text-emerald-900 cursor-pointer leading-snug line-clamp-2"
              title={folder.name}
            >
              {folder.name}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingName(true);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition-opacity"
              title="Rename folder"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
          {folder.description}
        </p>
      </div>

      {/* Progress Bar (Upload & Evidence Readiness) */}
      <div className="px-4 mt-3">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mb-1">
          <span>Evidence Completeness</span>
          <span className="font-mono tabular-nums text-slate-600">
            {isPopulated ? formatBytes(folder.totalSize) : '0%'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
          <div
            className={`h-full transition-all duration-300 ${
              isPopulated ? 'bg-emerald-600' : 'bg-amber-400/50'
            }`}
            style={{ width: `${Math.max(progressPercent, isPopulated ? 25 : 0)}%` }}
          />
        </div>
      </div>

      {/* Bottom Command Bar: Upload Folder & View Workspace */}
      <div className="p-3 mt-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* One-click Upload Folder */}
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/90 shadow-2xs transition-colors"
            title="Upload entire local folder"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px]">Upload</span>
          </button>

          {/* Individual file upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200/90 shadow-2xs transition-colors"
            title="Upload individual files"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
          </button>

          {isPopulated && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200/90 shadow-2xs transition-colors"
              title="Clear folder files"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Folder Button */}
        <button
          type="button"
          onClick={() => onOpenWorkspace(folder)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-all ${
            isPopulated
              ? 'bg-emerald-800 hover:bg-emerald-900 text-white'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Folder</span>
        </button>
      </div>
    </div>
  );
};
