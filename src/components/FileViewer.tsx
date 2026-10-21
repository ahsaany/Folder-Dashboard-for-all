import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  FileImage, 
  Download, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Copy, 
  Check, 
  FileCheck 
} from 'lucide-react';
import { FolderFile } from '../types';
import { PdfViewer } from './PdfViewer';
import { formatBytes } from '../services/exportService';

interface FileViewerProps {
  file: FolderFile | null;
  folderName: string;
}

export const FileViewer: React.FC<FileViewerProps> = ({ file, folderName }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setImageZoom(1);
    setImageRotation(0);
    setTextContent(null);

    if (!file) {
      setObjectUrl(null);
      return;
    }

    let url: string | null = null;
    if (file.blob) {
      url = URL.createObjectURL(file.blob);
      setObjectUrl(url);

      const ext = file.extension.toLowerCase();
      if (['txt', 'csv', 'json', 'md', 'html', 'log', 'xml'].includes(ext)) {
        file.blob.text().then((text) => setTextContent(text)).catch(() => {});
      }
    } else if (file.dataUrl) {
      setObjectUrl(file.dataUrl);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file]);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/50 rounded-xl border border-slate-200/80">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-sm">
          <FileText className="w-8 h-8 opacity-75" />
        </div>
        <h4 className="text-base font-semibold text-slate-800 mb-1">No Document Selected</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          Choose any evidence file or PDF from the list on the left to preview it directly inside the Cognia workspace.
        </p>
      </div>
    );
  }

  const ext = file.extension.toLowerCase();
  const isPdf = ext === 'pdf' || file.type === 'application/pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext) || file.type.startsWith('image/');
  const isText = ['txt', 'csv', 'json', 'md', 'html', 'log', 'xml'].includes(ext);

  const handleDownload = () => {
    if (!objectUrl) return;
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 1. PDF Viewer
  if (isPdf) {
    return <PdfViewer file={file} />;
  }

  // 2. Image Viewer
  if (isImage && objectUrl) {
    return (
      <div className="flex flex-col h-full bg-[#181818] rounded-xl border border-slate-700/60 overflow-hidden text-slate-200">
        {/* Ribbon */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-slate-700 text-xs">
          <div className="flex items-center gap-2 truncate">
            <FileImage className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-slate-100 truncate">{file.name}</span>
            <span className="text-slate-400 font-mono text-[11px] tabular-nums">({formatBytes(file.size)})</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setImageZoom((z) => Math.max(0.4, z - 0.2))}
              className="p-1.5 bg-[#2d2d30] hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono tabular-nums px-1">{Math.round(imageZoom * 100)}%</span>
            <button
              onClick={() => setImageZoom((z) => Math.min(3.0, z + 0.2))}
              className="p-1.5 bg-[#2d2d30] hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setImageRotation((r) => (r + 90) % 360)}
              className="p-1.5 bg-[#2d2d30] hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 bg-[#2d2d30] hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Download image"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Canvas / Image container */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <img
            src={objectUrl}
            alt={file.name}
            className="max-h-full max-w-full object-contain transition-transform duration-150 drop-shadow-lg"
            style={{
              transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
            }}
          />
        </div>
      </div>
    );
  }

  // 3. Text & Code Viewer
  if (isText && textContent !== null) {
    const lines = textContent.split('\n');
    return (
      <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl border border-slate-700/60 overflow-hidden text-slate-200">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#252526] border-b border-slate-700 text-xs">
          <div className="flex items-center gap-2 truncate">
            <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-slate-100 truncate">{file.name}</span>
            <span className="text-slate-400 font-mono text-[11px] tabular-nums">({lines.length} lines)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#2d2d30] hover:bg-slate-700 rounded text-slate-300 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 bg-[#2d2d30] hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed bg-[#181818]">
          <pre className="whitespace-pre-wrap">{textContent}</pre>
        </div>
      </div>
    );
  }

  // 4. Office Document & General Binary File Fallback
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-white/70 backdrop-blur-md rounded-xl border border-slate-200/90 shadow-sm text-center">
      <div className="w-20 h-20 mb-5 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-sm">
        {['xlsx', 'xls', 'csv'].includes(ext) ? (
          <FileSpreadsheet className="w-10 h-10" />
        ) : (
          <FileText className="w-10 h-10" />
        )}
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-1">{file.name}</h3>
      <p className="text-xs text-slate-500 mb-6 font-mono tabular-nums">
        {formatBytes(file.size)} · {ext.toUpperCase()} Document · Saved in {folderName}
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md w-full mb-6 text-left text-xs text-slate-600 space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-400">Cognia Archive:</span>
          <span className="font-semibold text-slate-700">{folderName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">File Type:</span>
          <span className="font-mono text-slate-700 uppercase">{ext}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Stored Date:</span>
          <span className="font-mono tabular-nums text-slate-700">
            {new Date(file.uploadedAt).toLocaleDateString()}
          </span>
        </div>
        {file.notes && (
          <div className="pt-2 border-t border-slate-200 text-slate-500 italic">
            "{file.notes}"
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download & Open Local Copy</span>
        </button>
      </div>
      <p className="text-[11px] text-slate-400 mt-3">
        Files are preserved 100% offline in your local database storage.
      </p>
    </div>
  );
};
