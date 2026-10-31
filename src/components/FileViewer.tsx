import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  FileImage, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Copy, 
  Check, 
  Music, 
  Video, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RefreshCw,
  Mail,
  Send,
  Inbox,
  Calendar,
  User,
  Paperclip,
  Layers,
  Sparkles,
  ExternalLink
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
  const [showRawEmail, setShowRawEmail] = useState<boolean>(false);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioVolume, setAudioVolume] = useState(1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Video player state
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setImageZoom(1);
    setImageRotation(0);
    setTextContent(null);
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setAudioCurrentTime(0);
    setShowRawEmail(false);

    if (!file) {
      setObjectUrl(null);
      return;
    }

    let url: string | null = null;
    if (file.blob) {
      url = URL.createObjectURL(file.blob);
      setObjectUrl(url);

      const ext = file.extension.toLowerCase();
      if (['txt', 'csv', 'json', 'md', 'html', 'log', 'xml', 'eml', 'msg'].includes(ext)) {
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
          Choose any evidence file, PDF, image, audio, or video from the list on the left to preview it directly inside the Cognia workspace.
        </p>
      </div>
    );
  }

  const ext = file.extension.toLowerCase();
  const isPdf = ext === 'pdf' || file.type === 'application/pdf';
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp', 'ico', 'tiff', 'avif'].includes(ext) || file.type.startsWith('image/');
  const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'm4v', 'mkv', 'avi'].includes(ext) || file.type.startsWith('video/');
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma', 'opus'].includes(ext) || file.type.startsWith('audio/');
  const isText = ['txt', 'csv', 'json', 'md', 'html', 'log', 'xml'].includes(ext);
  const isEmail = ['eml', 'msg', 'pst'].includes(ext) || file.type.includes('message');
  const isPsd = ext === 'psd' || file.type.includes('photoshop');

  // EML parsing helper
  const parseEmlData = (raw: string | null) => {
    if (!raw) {
      return {
        subject: file.name.replace(/\.[^/.]+$/, ''),
        from: 'Cognia Steering Committee <cognia@nada.edu.sa>',
        to: 'All Faculty & Administration <faculty@nada.edu.sa>',
        cc: '',
        date: new Date(file.lastModified || Date.now()).toUTCString(),
        body: 'Email message archived and preserved offline in Nada Cognia Evidence database.',
      };
    }
    const lines = raw.split(/\r?\n/);
    const headers: Record<string, string> = {};
    let bodyIndex = lines.length;
    let currHeader = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') {
        bodyIndex = i + 1;
        break;
      }
      const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (match) {
        currHeader = match[1].toLowerCase();
        headers[currHeader] = match[2];
      } else if (currHeader && (line.startsWith(' ') || line.startsWith('\t'))) {
        headers[currHeader] += ' ' + line.trim();
      }
    }

    const bodyText = lines.slice(bodyIndex).join('\n').trim();
    return {
      subject: headers['subject'] || file.name.replace(/\.[^/.]+$/, ''),
      from: headers['from'] || 'Nada International School <info@nada.edu.sa>',
      to: headers['to'] || 'Cognia Steering Team <cognia@nada.edu.sa>',
      cc: headers['cc'] || '',
      date: headers['date'] || new Date(file.lastModified || Date.now()).toLocaleString(),
      body: bodyText || raw.slice(0, 4000),
    };
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

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // 1. PDF Viewer
  if (isPdf) {
    return <PdfViewer file={file} />;
  }

  // 2. Video Player
  if (isVideo && objectUrl) {
    return (
      <div className="flex flex-col h-full bg-[#0f172a] rounded-xl border border-slate-700/60 overflow-hidden text-slate-200">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-slate-700 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Video className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium text-slate-100 truncate">{file.name}</span>
            <span className="text-slate-400 font-mono text-[11px] tabular-nums">({formatBytes(file.size)})</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 hover:text-white transition-colors"
              title="Download Video"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 bg-black/90">
          <video
            ref={videoRef}
            src={objectUrl}
            controls
            playsInline
            className="max-h-full max-w-full rounded-lg shadow-2xl"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }

  // 3. Audio Player
  if (isAudio && objectUrl) {
    const toggleAudioPlay = () => {
      if (!audioRef.current) return;
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play();
        setIsPlayingAudio(true);
      }
    };

    const handleAudioTimeUpdate = () => {
      if (!audioRef.current) return;
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setAudioCurrentTime(current);
      setAudioProgress((current / duration) * 100);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return;
      const newTime = (parseFloat(e.target.value) / 100) * (audioRef.current.duration || 1);
      audioRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
      setAudioProgress(parseFloat(e.target.value));
    };

    const toggleMute = () => {
      if (!audioRef.current) return;
      audioRef.current.muted = !isAudioMuted;
      setIsAudioMuted(!isAudioMuted);
    };

    return (
      <div className="flex flex-col h-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-950 rounded-xl border border-slate-700/60 overflow-hidden text-slate-100 p-8 justify-center items-center">
        <audio
          ref={audioRef}
          src={objectUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration || 0)}
          onEnded={() => setIsPlayingAudio(false)}
        />

        <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-2xl flex flex-col items-center">
          <div className="w-24 h-24 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 shadow-inner">
            <Music className="w-12 h-12 animate-pulse" />
          </div>

          <h3 className="text-base font-semibold text-white text-center mb-1 truncate max-w-full" title={file.name}>
            {file.name}
          </h3>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            {formatBytes(file.size)} · Audio Evidence Archive
          </p>

          {/* Progress bar */}
          <div className="w-full mb-3">
            <input
              type="range"
              min="0"
              max="100"
              value={audioProgress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
              <span>{formatTime(audioCurrentTime)}</span>
              <span>{formatTime(audioDuration)}</span>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center justify-between w-full mt-2">
            <button
              onClick={toggleMute}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              title={isAudioMuted ? 'Unmute' : 'Mute'}
            >
              {isAudioMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleAudioPlay}
              className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Download Audio"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Image Viewer
  if (isImage && objectUrl) {
    return (
      <div className="flex flex-col h-full bg-[#181818] rounded-xl border border-slate-700/60 overflow-hidden text-slate-200">
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

  // 5. Text & Code Viewer
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

  // 6. Outlook Email Message Viewer (.eml, .msg, .pst)
  if (isEmail) {
    const eml = parseEmlData(textContent);
    const senderInitials = eml.from
      .replace(/<.*?>/, '')
      .trim()
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NS';

    return (
      <div className="flex flex-col h-full bg-[#f8fafc] rounded-xl border border-slate-300 shadow-sm overflow-hidden text-slate-800">
        {/* Outlook Fluent Ribbon Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0078D4] text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-blue-100">Microsoft Outlook Email</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/20 font-mono">.{ext.toUpperCase()}</span>
              </div>
              <p className="text-xs font-semibold text-white truncate max-w-md">{eml.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowRawEmail(!showRawEmail)}
              className="px-2.5 py-1 text-xs rounded bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20"
              title="Toggle Raw MIME source"
            >
              {showRawEmail ? 'Formatted Email' : 'Raw MIME'}
            </button>
            <button
              onClick={handleCopyText}
              className="px-2.5 py-1 text-xs rounded bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20 flex items-center gap-1"
              title="Copy message body"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 text-xs rounded bg-white text-[#0078D4] font-semibold hover:bg-blue-50 transition-colors shadow-2xs flex items-center gap-1"
              title="Download original email"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Outlook Reading Pane */}
        <div className="flex-1 overflow-auto p-5 sm:p-6 space-y-4">
          {/* Email Subject Line */}
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              {eml.subject}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Cognia Evidence Email
              </span>
              <span>•</span>
              <span className="font-mono">{formatBytes(file.size)}</span>
              <span>•</span>
              <span>Folder: {folderName}</span>
            </div>
          </div>

          {/* Envelope & Sender Card */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
              {senderInitials}
            </div>
            <div className="flex-1 min-w-0 text-xs space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900 text-sm truncate">{eml.from}</span>
                <span className="text-slate-500 font-mono text-[11px] tabular-nums flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {eml.date}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-slate-600">
                <span className="font-medium text-slate-400">To:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200 truncate">
                  {eml.to}
                </span>
                {eml.cc && (
                  <>
                    <span className="font-medium text-slate-400 ml-2">Cc:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200 truncate">
                      {eml.cc}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Message Body Content */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs min-h-[220px]">
            {showRawEmail ? (
              <pre className="font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {textContent || 'Raw MIME data not loaded.'}
              </pre>
            ) : (
              <div className="text-sm text-slate-800 leading-relaxed space-y-3 font-sans whitespace-pre-line">
                {eml.body}
              </div>
            )}
          </div>

          {/* Offline Preservation Badge */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-blue-700 shrink-0" />
              <span>This email and its accreditation headers are securely stored offline in IndexedDB.</span>
            </div>
            <span className="font-semibold text-blue-800">100% Offline</span>
          </div>
        </div>
      </div>
    );
  }

  // 7. Adobe Photoshop Document (.psd) Graphic File Viewer
  if (isPsd) {
    return (
      <div className="flex flex-col h-full bg-[#0b1320] rounded-xl border border-slate-700 shadow-sm overflow-hidden text-slate-200">
        {/* Photoshop Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#001e36] text-white border-b border-[#0f3456]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#31a8ff] text-[#001e36] font-black text-xs flex items-center justify-center font-mono shadow-sm">
              Ps
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-[#31a8ff]">Adobe Photoshop Document</span>
              <p className="text-xs font-semibold text-white truncate max-w-sm">{file.name}</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#31a8ff] hover:bg-[#2090e0] text-[#001e36] font-bold text-xs rounded transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .PSD</span>
          </button>
        </div>

        {/* Photoshop Workspace Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#131b2a]/80">
          <div className="w-24 h-24 rounded-2xl bg-[#001e36] border-2 border-[#31a8ff]/40 shadow-xl flex items-center justify-center mb-5 relative group">
            <Layers className="w-12 h-12 text-[#31a8ff]" />
            <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded bg-[#31a8ff] text-[#001e36] text-[10px] font-bold uppercase font-mono">
              PSD
            </div>
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{file.name}</h3>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            {formatBytes(file.size)} · Adobe Photoshop Layers & Vectors · Module: {folderName}
          </p>

          <div className="bg-[#1e293b]/90 border border-slate-700 rounded-xl p-4 max-w-md w-full text-left text-xs space-y-2.5 text-slate-300 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Color Profile:</span>
              <span className="font-mono font-semibold text-[#31a8ff]">CMYK / RGB 300 DPI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">File Type:</span>
              <span className="font-mono text-slate-200">Adobe Photoshop Document (.psd)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Evidence Purpose:</span>
              <span className="text-slate-200">Branding, School Badges, Exhibits & Graphical Artifacts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Offline Status:</span>
              <span className="text-emerald-400 font-medium">Cached Locally in IndexedDB</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#31a8ff] hover:bg-[#2598e8] text-[#001e36] rounded-lg text-sm font-bold shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download & Open in Photoshop</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 8. Office Document & General Binary File Fallback
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
        {formatBytes(file.size)} · {ext.toUpperCase()} File · Stored in {folderName}
      </p>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md w-full mb-6 text-left text-xs text-slate-600 space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-400">Cognia Module:</span>
          <span className="font-semibold text-slate-700">{folderName}</span>
        </div>
        {file.subfolder && (
          <div className="flex justify-between">
            <span className="text-slate-400">Subfolder:</span>
            <span className="font-medium text-emerald-700">{file.subfolder}</span>
          </div>
        )}
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
