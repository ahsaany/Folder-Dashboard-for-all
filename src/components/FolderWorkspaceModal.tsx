import React, { useState, useEffect, useRef } from 'react';
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
  Minimize2
} from 'lucide-react';
import { CogniaFolder, FolderFile } from '../types';
import { getFilesInFolder, saveMultipleFiles, deleteFile, clearFolderFiles } from '../services/db';
import { exportFolderAsZip, formatBytes } from '../services/exportService';
import { FileViewer } from './FileViewer';

interface FolderWorkspaceModalProps {
  folder: CogniaFolder;
  onClose: () => void;
  onFolderUpdated: () => void;
}

export const FolderWorkspaceModal: React.FC<FolderWorkspaceModalProps> = ({
  folder,
  onClose,
  onFolderUpdated,
}) => {
  const [files, setFiles] = useState<FolderFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isFullWindow, setIsFullWindow] = useState<boolean>(false);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

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
  }, [folder.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = event.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    const newFiles: FolderFile[] = [];
    const total = rawFiles.length;

    for (let i = 0; i < total; i++) {
      const file = rawFiles[i];
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

      setUploadProgress(Math.round(((i + 1) / total) * 90));
    }

    await saveMultipleFiles(newFiles);
    setUploadProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 500);

    await loadFiles();
    onFolderUpdated();

    if (newFiles.length > 0) {
      setSelectedFileId(newFiles[0].id);
    }

    // Reset input
    if (event.target) event.target.value = '';
  };

  const handleDeleteFile = async (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to remove this evidence file from this folder?')) {
      await deleteFile(fileId);
      if (selectedFileId === fileId) {
        const remaining = files.filter((f) => f.id !== fileId);
        setSelectedFileId(remaining.length > 0 ? remaining[0].id : null);
      }
      await loadFiles();
      onFolderUpdated();
    }
  };

  const handleClearFolder = async () => {
    if (window.confirm(`Clear all ${files.length} files from "${folder.name}"? This action removes files from local offline storage.`)) {
      await clearFolderFiles(folder.id);
      setSelectedFileId(null);
      await loadFiles();
      onFolderUpdated();
    }
  };

  const handleExportZip = async () => {
    await exportFolderAsZip(folder, files);
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const selectedFile = files.find((f) => f.id === selectedFileId) || null;

  const getFileIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (e === 'pdf') return <FileText className="w-4 h-4 text-rose-500" />;
    if (['xlsx', 'xls', 'csv'].includes(e)) return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    if (['doc', 'docx', 'rtf'].includes(e)) return <FileText className="w-4 h-4 text-blue-600" />;
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(e)) return <FileImage className="w-4 h-4 text-amber-500" />;
    if (['json', 'txt', 'md', 'html'].includes(e)) return <FileCode className="w-4 h-4 text-violet-500" />;
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
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

      <div
        className={`flex flex-col bg-[#F9FAFB] border border-slate-300/80 shadow-2xl rounded-2xl overflow-hidden transition-all duration-200 ${
          isFullWindow ? 'w-full h-full' : 'w-full max-w-7xl h-[92vh]'
        }`}
      >
        {/* Windows 11 Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              {String(folder.id).padStart(2, '0')}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
                  {folder.standardCode}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">{folder.domain}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 truncate leading-snug">
                {folder.name}
              </h2>
            </div>
          </div>

          {/* Right Action Icons & Window Controls */}
          <div className="flex items-center gap-2">
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
              <span className="hidden sm:inline">Evidence Criteria</span>
            </button>

            {files.length > 0 && (
              <button
                onClick={handleExportZip}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors shadow-xs"
                title="Download Folder as ZIP"
              >
                <Archive className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Export ZIP</span>
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
              <p className="font-semibold text-amber-900">Cognia Standard Description:</p>
              <p className="text-amber-800 leading-relaxed">{folder.description}</p>
            </div>
            <div className="shrink-0 bg-white/80 p-2.5 rounded-lg border border-amber-200 max-w-md">
              <p className="font-semibold text-slate-800 mb-1">Key Evidence Artifacts to Upload:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                {folder.suggestedEvidences.map((item, idx) => (
                  <li key={idx} className="truncate">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Main Split Layout: Left File Explorer & Right PDF/File Viewer */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Files List (320px - 380px) */}
          <div className="w-72 md:w-88 border-r border-slate-200 bg-white/80 flex flex-col shrink-0">
            {/* Action Bar: Upload File & Upload Directory */}
            <div className="p-3 border-b border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Files</span>
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  title="Upload entire local folder"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Upload Folder</span>
                </button>
              </div>

              {/* Local Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter files in folder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600 focus:bg-white text-slate-800 transition-colors"
                />
              </div>
            </div>

            {/* Files List Scrollable */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 text-center text-xs text-slate-400">Loading offline file index...</div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <Folder className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No evidence documents</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Upload individual PDFs or an entire directory to store offline.
                  </p>
                </div>
              ) : (
                filteredFiles.map((file) => {
                  const isSelected = file.id === selectedFileId;
                  return (
                    <div
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      className={`group flex items-center justify-between p-3 cursor-pointer text-left transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/90 text-emerald-950 font-medium'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="shrink-0 p-1.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                          {getFileIcon(file.extension)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs truncate font-medium text-slate-900 group-hover:text-emerald-900">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono tabular-nums flex items-center gap-1.5">
                            <span>{formatBytes(file.size)}</span>
                            <span>·</span>
                            <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteFile(file.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-600 hover:bg-rose-50 rounded transition-all shrink-0"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Left Panel Footer Summary */}
            <div className="p-3 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono tabular-nums">
                {files.length} {files.length === 1 ? 'file' : 'files'} · {formatBytes(folder.totalSize)}
              </span>
              {files.length > 0 && (
                <button
                  onClick={handleClearFolder}
                  className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Right Panel: Integrated File & PDF Viewer */}
          <div className="flex-1 p-3 md:p-4 bg-slate-100/70 overflow-hidden flex flex-col">
            <FileViewer file={selectedFile} folderName={folder.name} />
          </div>
        </div>
      </div>
    </div>
  );
};
