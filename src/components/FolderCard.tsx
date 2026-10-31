import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  HardDrive,
  Star,
  CheckSquare,
  Square,
  Palette,
  Edit2
} from 'lucide-react';
import { CogniaFolder, FolderFile, FOLDER_COLOR_PALETTE } from '../types';
import { 
  saveMultipleFiles, 
  updateFolderMetadata, 
  clearFolderFiles, 
  updateFolderRating,
  updateFolderDescription,
  updateFolderColor
} from '../services/db';
import { formatBytes } from '../services/exportService';
import { ConfirmModal, ConfirmDialogState } from './ConfirmModal';

interface FolderCardProps {
  folder: CogniaFolder;
  onOpenWorkspace: (folder: CogniaFolder) => void;
  onRefresh: () => void;
  onDeleteFolder?: (folderId: number) => void;
  isManageMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (folderId: number) => void;
  index?: number;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onOpenWorkspace,
  onRefresh,
  onDeleteFolder,
  isManageMode = false,
  isSelected = false,
  onToggleSelect,
  index = 0,
}) => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(folder.name);
  const [isEditingDesc, setIsEditingDesc] = useState<boolean>(false);
  const [editedDesc, setEditedDesc] = useState<string>(folder.description);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isPopulated = folder.fileCount > 0;
  const currentRating = folder.rating !== undefined ? folder.rating : (isPopulated ? 4 : 0);
  const currentColor = folder.color || '#1B5E20';

  const handleSetRating = async (ratingVal: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateFolderRating(folder.id, ratingVal);
    onRefresh();
  };

  const handleChangeColor = async (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateFolderColor(folder.id, hex);
    setShowColorPicker(false);
    onRefresh();
  };

  // Handle Directory Upload via webkitdirectory (with subfolder detection)
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

      // Extract subfolder if relative path has directory depth
      let subfolderName: string | undefined = undefined;
      const relPath = (file as any).webkitRelativePath;
      if (relPath && relPath.includes('/')) {
        const parts = relPath.split('/');
        if (parts.length > 2) {
          subfolderName = parts.slice(1, parts.length - 1).join(' / ');
        }
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

  const handleSaveDescription = async () => {
    if (editedDesc.trim() && editedDesc !== folder.description) {
      await updateFolderDescription(folder.id, editedDesc.trim());
      folder.description = editedDesc.trim();
      onRefresh();
    }
    setIsEditingDesc(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Folder Files',
      message: `Clear all ${folder.fileCount} evidence files from "${folder.name}"? This removes them from local offline storage.`,
      confirmLabel: 'Clear Files',
      isDestructive: true,
      onConfirm: async () => {
        await clearFolderFiles(folder.id);
        onRefresh();
      },
    });
  };

  const handleDeleteModule = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteFolder) {
      setConfirmDialog({
        isOpen: true,
        title: `Delete Module ${String(folder.id).padStart(2, '0')}`,
        message: `Are you sure you want to delete Module ${folder.id} ("${folder.name}") and all ${folder.fileCount} stored files? This cannot be undone.`,
        confirmLabel: 'Delete Module',
        isDestructive: true,
        onConfirm: () => {
          onDeleteFolder(folder.id);
        },
      });
    }
  };

  // Progress ratio based on 2+ evidence docs
  const targetFiles = 2;
  const progressRatio = Math.min(folder.fileCount / targetFiles, 1);
  const progressPercent = Math.round(progressRatio * 100);

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'Leadership Capacity':
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'Learning Capacity':
        return 'text-sky-800 bg-sky-50 border-sky-200';
      case 'Resource Capacity':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'Accreditation Exhibits':
        return 'text-purple-800 bg-purple-50 border-purple-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration: 0.32,
        delay: Math.min(index * 0.025, 0.4),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col bg-white/90 backdrop-blur-md rounded-2xl border transition-colors duration-200 overflow-hidden shadow-xs hover:shadow-md ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-400/50 bg-amber-50/20'
          : isDraggingOver
          ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/50'
          : isPopulated
          ? 'border-slate-200/90 hover:border-slate-300'
          : 'border-slate-200/80'
      }`}
    >
      {/* Hidden File Inputs supporting all media */}
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
        accept="*/*"
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

      {/* Top Card Bar: Number Badge, Domain, Checkbox / Delete, Status */}
      <div className="p-4 pb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Manage Mode Checkbox */}
          {isManageMode && onToggleSelect && (
            <button
              type="button"
              onClick={() => onToggleSelect(folder.id)}
              className="text-amber-600 hover:text-amber-700 p-0.5"
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-amber-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400" />
              )}
            </button>
          )}

          {/* Color-Coded Number Badge */}
          <div 
            className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs font-mono shadow-2xs shrink-0"
            style={{ backgroundColor: currentColor }}
          >
            {String(folder.id).padStart(2, '0')}
          </div>

          <div>
            <div className="text-xs font-mono font-bold text-slate-800">
              Module {String(folder.id).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Right Header Area: Status Badge & Color Palette Trigger */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Color Picker Popover Button */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(!showColorPicker);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Folder Color"
            >
              <span 
                className="w-2.5 h-2.5 rounded-full block border border-black/15 shadow-2xs"
                style={{ backgroundColor: currentColor }}
              />
            </button>

            {showColorPicker && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 z-40 p-2 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-wrap gap-1 w-40 animate-in fade-in"
              >
                {FOLDER_COLOR_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={(e) => handleChangeColor(c.hex, e)}
                    className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center hover:scale-115 transition-transform"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {currentColor === c.hex && <Check className="w-3 h-3 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Populated / Empty Badge */}
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

          {/* Delete Single Module Button */}
          {onDeleteFolder && (
            <button
              type="button"
              onClick={handleDeleteModule}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title={`Delete Module ${String(folder.id).padStart(2, '0')}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Folder Name */}
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

        {/* Editable Description under Heading */}
        {isEditingDesc ? (
          <div className="mt-1.5 space-y-1">
            <textarea
              value={editedDesc}
              onChange={(e) => setEditedDesc(e.target.value)}
              rows={2}
              className="w-full text-xs p-1.5 bg-white border border-emerald-600 rounded-md text-slate-800 focus:outline-hidden"
              placeholder="Enter module description..."
            />
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={handleSaveDescription}
                className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-semibold flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditingDesc(false)}
                className="px-1.5 py-0.5 text-slate-400 hover:bg-slate-100 rounded text-[10px]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditingDesc(true)}
            className="group/desc flex items-start justify-between gap-1 cursor-pointer mt-1"
            title="Click to edit description"
          >
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {folder.description || 'Add module description...'}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingDesc(true);
              }}
              className="opacity-0 group-hover/desc:opacity-100 p-0.5 text-slate-400 hover:text-emerald-700 transition-opacity shrink-0"
              title="Edit description"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 5 Stars Rating & Storage Section */}
      <div className="px-4 mt-3">
        {/* 5 Stars Rating (Above Storage) */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold text-slate-500 font-mono">
            Rating
          </span>
          <div 
            className="flex items-center gap-0.5" 
            title={`Rating: ${currentRating} of 5 Stars (Click to change)`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={(e) => handleSetRating(star, e)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 text-amber-400 hover:scale-125 transition-transform"
                title={`Rate ${star} Star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    star <= (hoverRating || currentRating)
                      ? 'fill-amber-400 text-amber-500 drop-shadow-2xs'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Storage Bar */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
          <span>Storage</span>
          <span className="font-mono tabular-nums text-slate-700 font-semibold">
            {isPopulated ? formatBytes(folder.totalSize) : '0 B'}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
          <div
            className="h-full transition-all duration-300"
            style={{ 
              width: `${Math.max(progressPercent, isPopulated ? 25 : 0)}%`,
              backgroundColor: currentColor
            }}
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
            title="Upload individual files (PDF, audio, video, images)"
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
              ? 'text-white'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
          }`}
          style={isPopulated ? { backgroundColor: currentColor } : {}}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Folder</span>
        </button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmModal
        dialog={confirmDialog}
        onClose={() => setConfirmDialog(null)}
      />
    </motion.div>
  );
};
