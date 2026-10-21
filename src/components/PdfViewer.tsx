import React, { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Printer, 
  Download, 
  RotateCw, 
  FileText,
  Eye,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { FolderFile } from '../types';

interface PdfViewerProps {
  file: FolderFile;
  onClose?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ file }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<'canvas' | 'native'>('canvas');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<any>(null);

  // Create Object URL from Blob
  useEffect(() => {
    let url: string | null = null;
    if (file.blob) {
      url = URL.createObjectURL(file.blob);
      setObjectUrl(url);
    } else if (file.dataUrl) {
      setObjectUrl(file.dataUrl);
    }

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [file]);

  // Load PDF document using PDF.js if available
  useEffect(() => {
    if (!objectUrl) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadPdfWithLib = async () => {
      const pdfjs = (window as any).pdfjsLib;
      if (!pdfjs) {
        // Fallback directly to native iframe/embed
        setRenderMode('native');
        setLoading(false);
        return;
      }

      try {
        const loadingTask = pdfjs.getDocument(objectUrl);
        const pdf = await loadingTask.promise;
        if (!isMounted) return;

        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setPageNumber(1);
        setLoading(false);
      } catch (err: any) {
        console.warn('PDF.js render error, switching to native preview:', err);
        if (isMounted) {
          setRenderMode('native');
          setLoading(false);
        }
      }
    };

    loadPdfWithLib();

    return () => {
      isMounted = false;
    };
  }, [objectUrl]);

  // Render current page to canvas
  useEffect(() => {
    if (renderMode !== 'canvas' || !pdfDocRef.current || !canvasRef.current) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDocRef.current.getPage(pageNumber);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const viewport = page.getViewport({ scale, rotation });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err: any) {
        if (!isCancelled) {
          console.warn('Page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
    };
  }, [pageNumber, scale, rotation, renderMode]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handlePrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));

  const handlePrint = () => {
    if (!objectUrl) return;
    const printWindow = window.open(objectUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleDownload = () => {
    if (!objectUrl) return;
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`flex flex-col h-full bg-[#1e1e1e] text-slate-200 select-none overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50 p-4' : 'rounded-xl border border-slate-700/60'
      }`}
    >
      {/* Top Windows 11 Fluent Command Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#252526] border-b border-slate-700/80 text-xs">
        {/* Document Title & Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-slate-100 truncate max-w-[200px] md:max-w-[320px]" title={file.name}>
            {file.name}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
            PDF Document
          </span>
        </div>

        {/* Viewer Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {renderMode === 'canvas' && (
            <>
              {/* Page Nav */}
              <div className="flex items-center gap-1 bg-[#2d2d30] px-2 py-1 rounded-md border border-slate-700">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={pageNumber <= 1}
                  className="p-1 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono tabular-nums px-1 text-slate-200">
                  {pageNumber} / {numPages}
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={pageNumber >= numPages}
                  className="p-1 text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-[#2d2d30] px-1.5 py-1 rounded-md border border-slate-700">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1 text-slate-300 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono tabular-nums px-1.5 text-slate-300 min-w-[38px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1 text-slate-300 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rotate */}
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 bg-[#2d2d30] hover:bg-slate-700 rounded-md border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Render Mode Switcher: Canvas vs Native Browser PDF */}
          <div className="flex items-center rounded-md bg-[#2d2d30] p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setRenderMode('canvas')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                renderMode === 'canvas' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reader
            </button>
            <button
              type="button"
              onClick={() => setRenderMode('native')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                renderMode === 'native' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Native
            </button>
          </div>

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 bg-[#2d2d30] hover:bg-slate-700 rounded-md border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Print Document"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 bg-[#2d2d30] hover:bg-slate-700 rounded-md border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Download Local Copy"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 bg-[#2d2d30] hover:bg-slate-700 rounded-md border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main PDF Content Viewport */}
      <div className="relative flex-1 bg-[#181818] overflow-auto flex items-center justify-center p-4">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="w-7 h-7 animate-spin text-emerald-400" />
            <span className="text-xs">Preparing document canvas...</span>
          </div>
        )}

        {error && (
          <div className="text-center p-6 bg-red-950/40 border border-red-800 rounded-xl max-w-md">
            <p className="text-sm text-red-300 mb-3">{error}</p>
            <button
              onClick={() => setRenderMode('native')}
              className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded text-xs"
            >
              Switch to Native PDF Frame
            </button>
          </div>
        )}

        {!loading && !error && renderMode === 'canvas' && (
          <div className="flex flex-col items-center justify-center min-h-full py-4">
            <div className="shadow-2xl shadow-black/80 rounded border border-slate-700 bg-white">
              <canvas ref={canvasRef} className="block max-w-full h-auto" />
            </div>
          </div>
        )}

        {!loading && renderMode === 'native' && objectUrl && (
          <iframe
            src={objectUrl}
            className="w-full h-full rounded border-0 bg-white"
            title={file.name}
          />
        )}
      </div>

      {/* Bottom Status Strip */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>Cognia Evidence Document</span>
          <span>·</span>
          <span>Offline Ready</span>
        </div>
        <div className="font-mono tabular-nums text-slate-400">
          {pageNumber} / {numPages} pages
        </div>
      </div>
    </div>
  );
};
