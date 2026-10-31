import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  Folder, 
  ArrowRight, 
  FileSpreadsheet, 
  FileImage, 
  FileCode, 
  File, 
  Music, 
  Video 
} from 'lucide-react';
import { CogniaFolder, FolderFile, SearchResult } from '../types';
import { searchFiles } from '../services/db';
import { formatBytes } from '../services/exportService';

interface GlobalSearchModalProps {
  folders: CogniaFolder[];
  onClose: () => void;
  onSelectResult: (folder: CogniaFolder, file?: FolderFile) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  folders,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [matchingFolders, setMatchingFolders] = useState<CogniaFolder[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const runSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setMatchingFolders([]);
        return;
      }

      setIsSearching(true);
      const cleanQ = query.toLowerCase().trim();

      // Search folders
      const matchedF = folders.filter(
        (f) =>
          f.name.toLowerCase().includes(cleanQ) ||
          f.description.toLowerCase().includes(cleanQ) ||
          f.domain.toLowerCase().includes(cleanQ) ||
          `module ${f.id}`.includes(cleanQ) ||
          `folder ${f.id}`.includes(cleanQ)
      );
      setMatchingFolders(matchedF);

      // Search files
      const matchedFiles = await searchFiles(query, folders);
      setResults(matchedFiles);
      setIsSearching(false);
    };

    const timer = setTimeout(runSearch, 150);
    return () => clearTimeout(timer);
  }, [query, folders]);

  const getFileIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (e === 'pdf') return <FileText className="w-4 h-4 text-rose-500" />;
    if (['xlsx', 'xls', 'csv'].includes(e)) return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    if (['doc', 'docx'].includes(e)) return <FileText className="w-4 h-4 text-blue-600" />;
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(e)) return <FileImage className="w-4 h-4 text-amber-500" />;
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(e)) return <Music className="w-4 h-4 text-purple-500" />;
    if (['mp4', 'webm', 'mov', 'avi'].includes(e)) return <Video className="w-4 h-4 text-indigo-500" />;
    if (['json', 'txt', 'md'].includes(e)) return <FileCode className="w-4 h-4 text-violet-500" />;
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
          <Search className="w-5 h-5 text-emerald-700 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search folders, evidence documents, audio, video..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-0 focus:outline-hidden text-slate-900 placeholder-slate-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {!query.trim() && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Search className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <p className="font-medium text-slate-600">Global Evidence Search</p>
              <p className="mt-1 text-slate-400">
                Type keywords like "Leadership", "Curriculum", "Survey", "Safety", or file extensions like ".pdf", ".mp4", ".mp3"
              </p>
            </div>
          )}

          {query.trim() && matchingFolders.length === 0 && results.length === 0 && !isSearching && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <p className="font-medium text-slate-600">No matching files or folders found</p>
              <p className="mt-1 text-slate-400">
                Try searching for module names or upload evidence into empty slots.
              </p>
            </div>
          )}

          {/* Matching Folders Section */}
          {matchingFolders.length > 0 && (
            <div className="p-2 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 font-mono">
                Matching Modules & Folders ({matchingFolders.length})
              </span>
              {matchingFolders.slice(0, 5).map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => onSelectResult(folder)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/80 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs font-mono shrink-0 shadow-2xs"
                      style={{ backgroundColor: folder.color || '#1B5E20' }}
                    >
                      {String(folder.id).padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 truncate">
                        {folder.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Module {String(folder.id).padStart(2, '0')} · {folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Matching Files Section */}
          {results.length > 0 && (
            <div className="p-2 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 font-mono">
                Matching Evidence Files ({results.length})
              </span>
              {results.map(({ file, folder }) => (
                <div
                  key={file.id}
                  onClick={() => onSelectResult(folder, file)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/80 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                      {getFileIcon(file.extension)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                        <span className="text-emerald-800 font-semibold">{folder.name}</span>
                        {file.subfolder && (
                          <>
                            <span>/</span>
                            <span className="text-slate-600">{file.subfolder}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{formatBytes(file.size)}</span>
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with mouse or arrow keys</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
