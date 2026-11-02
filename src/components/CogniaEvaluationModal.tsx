import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Upload, 
  RefreshCw, 
  Award, 
  Filter, 
  ExternalLink, 
  Download, 
  Printer, 
  ChevronRight, 
  Check, 
  FileSpreadsheet, 
  HelpCircle,
  TrendingUp,
  FolderOpen,
  Sliders,
  ShieldCheck,
  Flame,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { CogniaFolder, FolderFile } from '../types';
import { 
  evaluateAllModules, 
  EvaluationResult, 
  ModuleEvaluation, 
  CharacteristicSummary,
  COGNIA_STANDARDS_CATALOG 
} from '../services/cogniaEvaluationService';
import { 
  getAllFiles, 
  getMasterStandardsDoc, 
  saveMasterStandardsDoc, 
  resetMasterStandardsDoc, 
  MasterStandardsDoc 
} from '../services/db';
import { SchoolLogo } from './SchoolLogo';

interface CogniaEvaluationModalProps {
  folders: CogniaFolder[];
  onClose: () => void;
  onOpenFolderWorkspace: (folder: CogniaFolder) => void;
  onViewCogniaPdf: () => void;
  schoolName?: string;
  customLogo?: string | null;
}

export const CogniaEvaluationModal: React.FC<CogniaEvaluationModalProps> = ({
  folders,
  onClose,
  onOpenFolderWorkspace,
  onViewCogniaPdf,
  schoolName = 'Nada International School',
  customLogo,
}) => {
  const [allFiles, setAllFiles] = useState<FolderFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'needs-work' | 'operational' | 'exemplary'>('critical');
  const [selectedCharFilter, setSelectedCharFilter] = useState<string>('all');
  const [activeGaugeTarget, setActiveGaugeTarget] = useState<'overall' | string>('overall');
  const [masterDoc, setMasterDoc] = useState<MasterStandardsDoc | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // Load files, master doc, and compute evaluation
  const runEvaluation = async () => {
    setLoading(true);
    try {
      const [files, doc] = await Promise.all([
        getAllFiles(),
        getMasterStandardsDoc(),
      ]);
      setAllFiles(files);
      setMasterDoc(doc);
      const result = evaluateAllModules(folders, files);
      setEvaluation(result);
    } catch (err) {
      console.error('Failed to run Cognia audit evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, [folders]);

  const handleUploadMasterPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a valid PDF document for master standards.');
      return;
    }

    setUploadingPdf(true);
    try {
      const saved = await saveMasterStandardsDoc(file);
      setMasterDoc(saved);
      // Re-run evaluation with custom document acknowledgment
      await runEvaluation();
    } catch (err) {
      console.error('Failed to save master standards PDF:', err);
      alert('Could not save PDF to local database. Please try again.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleResetMasterPdf = async () => {
    if (confirm('Reset to official Cognia Performance Standards Resource Cards PDF?')) {
      await resetMasterStandardsDoc();
      setMasterDoc(null);
      await runEvaluation();
    }
  };

  if (!evaluation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center">
          <Activity className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
          <h3 className="text-base font-bold text-slate-800">Analyzing Cognia Accreditation Data...</h3>
          <p className="text-xs text-slate-500 mt-1">
            Scanning all 35 modules, files, and sample evidence against Cognia Performance Standards Resource Cards.
          </p>
        </div>
      </div>
    );
  }

  // Determine active score to display on the animated gauge
  let currentGaugeScore = evaluation.overallScore;
  let currentGaugeLabel = 'Overall Readiness';
  let currentGaugeDescription = evaluation.summaryTextEn;
  let currentLevelNum = evaluation.level;

  if (activeGaugeTarget !== 'overall') {
    const char = evaluation.characteristics.find((c) => c.name === activeGaugeTarget);
    if (char) {
      currentGaugeScore = char.score;
      currentGaugeLabel = char.name;
      currentGaugeDescription = `Evaluated score for ${char.name}: ${char.populatedStandards} of ${char.totalStandards} standards covered with ${char.totalFiles} evidence files.`;
      currentLevelNum = char.score >= 85 ? 4 : char.score >= 60 ? 3 : char.score >= 30 ? 2 : 1;
    }
  }

  // Gauge angle (-90 deg at 0%, to +90 deg at 100%)
  const needleAngle = -90 + (currentGaugeScore / 100) * 180;

  // Filter modules for Priority Attention list
  const filteredModules = evaluation.moduleEvaluations.filter((m) => {
    if (selectedFilter !== 'all' && m.status !== selectedFilter) return false;
    if (selectedCharFilter !== 'all' && m.characteristic !== selectedCharFilter) return false;
    return true;
  });

  const handleOpenModule = (folderId: number) => {
    const target = folders.find((f) => f.id === folderId);
    if (target) {
      onOpenFolderWorkspace(target);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-[1500px] h-[94vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Title Bar with School Branding & Cognia Shield */}
        <div className="px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-emerald-50/30 to-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <SchoolLogo size={42} customLogo={customLogo} />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-amber-300 font-mono">
                  COGNIA AUDIT GAUGE
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Cognia Performance Standards Diagnostic & Live Gauge
                </h2>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>K–12 Resource Cards Standards</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span className="font-semibold text-emerald-900">{schoolName}</span>
                <span>•</span>
                <span>Automated Evidence Diagnostic & Comparison Gauge</span>
                <span>•</span>
                <span>31 Cognia Standards + 4 Institutional Exhibits</span>
                <span>•</span>
                <span className="font-mono text-[11px]">Evaluated: {new Date(evaluation.evaluatedAt).toLocaleTimeString()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Master Standards Document Picker / Uploader */}
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleUploadMasterPdf}
              className="hidden"
            />

            {masterDoc ? (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-300 rounded-lg text-xs font-semibold">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span className="truncate max-w-[140px]" title={masterDoc.name}>
                  {masterDoc.name}
                </span>
                <button
                  type="button"
                  onClick={handleResetMasterPdf}
                  className="text-blue-500 hover:text-rose-600 ml-1"
                  title="Reset to official Cognia cards"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={uploadingPdf}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
                title="Upload custom offline Master Standards PDF for comparison & audit"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Upload Custom Standards PDF</span>
              </button>
            )}

            {/* View Official Cognia Cards PDF Button */}
            <button
              onClick={onViewCogniaPdf}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              title="Read official Cognia Performance Standards Resource Cards PDF"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>{masterDoc ? 'View Master Standards PDF' : 'Open Official Standards PDF'}</span>
              <ExternalLink className="w-3 h-3 text-amber-600 ml-0.5" />
            </button>

            {/* Re-Analyze / Refresh */}
            <button
              onClick={runEvaluation}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-50"
              title="Re-run deep evidence analysis across all modules"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Audit</span>
            </button>

            {/* Print / Export Report */}
            <button
              onClick={handlePrintReport}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
              title="Print Evaluation Report"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
              title="Close Audit Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT COLUMN: Animated Moving Gauge & Characteristic Scorecards */}
          <div className="w-full lg:w-[460px] xl:w-[500px] border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-5 overflow-y-auto space-y-5 shrink-0 flex flex-col justify-between">
            <div>
              {/* Animated Speedometer / Moving Gauge Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Live Moving Readiness Gauge
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Precision Instrument
                  </span>
                </div>

                {/* SVG Semi-Circular Speedometer Dial */}
                <div className="relative flex flex-col items-center justify-center pt-2 pb-0">
                  <svg
                    className="w-72 h-40 sm:w-80 sm:h-44 overflow-visible"
                    viewBox="0 0 240 140"
                  >
                    <defs>
                      <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#EF4444" />    {/* Red: Insufficient */}
                        <stop offset="35%" stopColor="#F59E0B" />   {/* Amber: Emerging */}
                        <stop offset="70%" stopColor="#10B981" />   {/* Emerald: Operational */}
                        <stop offset="100%" stopColor="#059669" />  {/* Forest: Exemplary */}
                      </linearGradient>
                      <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0f172a" floodOpacity="0.4" />
                      </filter>
                    </defs>

                    {/* Background Track Arc */}
                    <path
                      d="M 25 125 A 95 95 0 0 1 215 125"
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="18"
                      strokeLinecap="round"
                    />

                    {/* Colored Active Arc */}
                    <path
                      d="M 25 125 A 95 95 0 0 1 215 125"
                      fill="none"
                      stroke="url(#gaugeGradient)"
                      strokeWidth="18"
                      strokeLinecap="round"
                      opacity="0.95"
                    />

                    {/* Tick Marks for 0%, 25%, 50%, 75%, 100% */}
                    {[
                      { percent: 0, label: '0%' },
                      { percent: 25, label: '25%' },
                      { percent: 50, label: '50%' },
                      { percent: 75, label: '75%' },
                      { percent: 100, label: '100%' },
                    ].map((tick, i) => {
                      const ang = -180 + (tick.percent / 100) * 180;
                      const rad = (ang * Math.PI) / 180;
                      const x1 = 120 + 82 * Math.cos(rad);
                      const y1 = 125 + 82 * Math.sin(rad);
                      const x2 = 120 + 72 * Math.cos(rad);
                      const y2 = 125 + 72 * Math.sin(rad);
                      return (
                        <g key={i}>
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#475569"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    })}

                    {/* Animated Moving Needle Pivot Group */}
                    <g transform="translate(120, 125)">
                      <motion.g
                        initial={{ rotate: -90 }}
                        animate={{ rotate: needleAngle }}
                        transition={{
                          type: 'spring',
                          damping: 14,
                          stiffness: 85,
                          mass: 0.8,
                        }}
                      >
                        {/* Needle Body */}
                        <line
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="-86"
                          stroke="#0F172A"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          filter="url(#needleGlow)"
                        />
                        {/* Red Pointer Tip */}
                        <polygon
                          points="-3,-74 0,-92 3,-74"
                          fill="#DC2626"
                        />
                      </motion.g>

                      {/* Center Hub Chrome Ring */}
                      <circle cx="0" cy="0" r="13" fill="#1E293B" />
                      <circle cx="0" cy="0" r="7" fill="#F8FAFC" />
                      <circle cx="0" cy="0" r="3.5" fill="#DC2626" />
                    </g>
                  </svg>

                  {/* Digital Counter & Status Box below Needle */}
                  <div className="text-center -mt-2">
                    <motion.div
                      key={currentGaugeScore}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-baseline justify-center gap-1"
                    >
                      <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
                        {currentGaugeScore}
                      </span>
                      <span className="text-lg font-bold text-slate-500 font-mono">%</span>
                    </motion.div>

                    {/* Dynamic Rubric Badge */}
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs">
                      {currentLevelNum === 4 ? (
                        <span className="text-emerald-800 bg-emerald-100 border-emerald-300 px-2.5 py-0.5 rounded-full">
                          ⭐ Level 4: Exemplary (Cognia Ready)
                        </span>
                      ) : currentLevelNum === 3 ? (
                        <span className="text-teal-800 bg-teal-100 border-teal-300 px-2.5 py-0.5 rounded-full">
                          ✓ Level 3: Operational (Proficient)
                        </span>
                      ) : currentLevelNum === 2 ? (
                        <span className="text-amber-800 bg-amber-100 border-amber-300 px-2.5 py-0.5 rounded-full">
                          ⚠️ Level 2: Emerging (Work In Progress)
                        </span>
                      ) : (
                        <span className="text-rose-800 bg-rose-100 border-rose-300 px-2.5 py-0.5 rounded-full">
                          🚨 Level 1: Insufficient (Priority Evidence Needed)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium mt-1.5 max-w-xs mx-auto line-clamp-2">
                      {currentGaugeLabel}: {currentGaugeDescription}
                    </p>
                  </div>
                </div>

                {/* Gauge Mode Switcher: Overall or Characteristic Specific */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
                  <button
                    onClick={() => setActiveGaugeTarget('overall')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      activeGaugeTarget === 'overall'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Overall Portal
                  </button>
                  {evaluation.characteristics.map((char) => (
                    <button
                      key={char.name}
                      onClick={() => setActiveGaugeTarget(char.name)}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        activeGaugeTarget === char.name
                          ? 'bg-emerald-800 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {char.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Key Characteristics Breakdown Cards */}
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                  <span>Cognia 4 Key Characteristics</span>
                  <span className="font-mono">Standards Breakdown</span>
                </div>

                {evaluation.characteristics.map((char) => {
                  const isSelected = activeGaugeTarget === char.name;
                  return (
                    <div
                      key={char.name}
                      onClick={() => {
                        setActiveGaugeTarget(char.name);
                        setSelectedCharFilter(selectedCharFilter === char.name ? 'all' : char.name);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                          : 'bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: char.color }}
                          />
                          <span className="text-xs font-bold text-slate-800">{char.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold font-mono tabular-nums text-slate-900">
                            {char.score}%
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            ({char.populatedStandards}/{char.totalStandards})
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200/60">
                        <div
                          className="h-full transition-all duration-500 rounded-full"
                          style={{
                            width: `${char.score}%`,
                            backgroundColor: char.score >= 80 ? '#059669' : char.score >= 60 ? '#10B981' : char.score >= 30 ? '#F59E0B' : '#EF4444',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                        <span className="text-slate-600 font-medium">{char.level}</span>
                        <span className="font-mono text-slate-400">{char.totalFiles} files</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Pill at bottom of left panel */}
            <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 space-y-1">
              <div className="flex justify-between font-mono">
                <span>Total Modules:</span>
                <span className="font-bold text-slate-700">{evaluation.totalModules} Standards</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Populated with Evidence:</span>
                <span className="font-bold text-emerald-700">{evaluation.populatedModules} Modules</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>Total Evidence Files:</span>
                <span className="font-bold text-slate-800">{evaluation.totalFiles} Files</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Priority Gaps & Areas Needing Work */}
          <div className="flex-1 flex flex-col bg-slate-100/50 overflow-hidden">
            
            {/* Filter and Headline Ribbon */}
            <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-600" />
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Priority Evidence Gaps & Areas Needing Attention
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated gap analysis checks missing policies, surveys, observation logs, and rubrics required by Cognia.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setSelectedFilter('critical')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                    selectedFilter === 'critical'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Missing Evidence ({evaluation.priorityGaps.filter((g) => g.status === 'critical').length})</span>
                </button>

                <button
                  onClick={() => setSelectedFilter('needs-work')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedFilter === 'needs-work'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>Needs Work ({evaluation.priorityGaps.filter((g) => g.status === 'needs-work').length})</span>
                </button>

                <button
                  onClick={() => setSelectedFilter('operational')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedFilter === 'operational'
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>Operational ({evaluation.operationalModules.filter((o) => o.status === 'operational').length})</span>
                </button>

                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    selectedFilter === 'all'
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>All 35 ({evaluation.moduleEvaluations.length})</span>
                </button>
              </div>
            </div>

            {/* List of Module Cards with missing evidence checklists & 1-click Upload Button */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {filteredModules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-2" />
                  <h4 className="text-base font-bold text-slate-800">No Critical Gaps in this Category!</h4>
                  <p className="text-xs text-slate-500 max-w-md mt-1">
                    All standards in this selected filter have documented evidence files stored in your local repository.
                  </p>
                </div>
              ) : (
                filteredModules.map((item) => {
                  const isCritical = item.status === 'critical';
                  const isNeedsWork = item.status === 'needs-work';
                  const isExemplary = item.status === 'exemplary';

                  return (
                    <motion.div
                      key={item.folderId}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all bg-white shadow-2xs hover:shadow-sm ${
                        isCritical
                          ? 'border-rose-300 hover:border-rose-400 ring-1 ring-rose-200/40'
                          : isNeedsWork
                          ? 'border-amber-300 hover:border-amber-400'
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              Module {item.folderId < 10 ? `0${item.folderId}` : item.folderId}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              {item.characteristic}
                            </span>
                            {isCritical && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>0 Evidence Files (Urgent Evidence Required)</span>
                              </span>
                            )}
                            {isNeedsWork && (
                              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                In Progress ({item.fileCount} {item.fileCount === 1 ? 'file' : 'files'})
                              </span>
                            )}
                            {isExemplary && (
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Complete & Verified ({item.fileCount} files)
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                            {item.standardName}
                          </h4>

                          {/* Recommendation in English */}
                          <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                            <p className="text-slate-700 font-medium leading-relaxed">
                              {item.recommendationEn}
                            </p>
                          </div>
                        </div>

                        {/* Right: Score Pill & Direct 1-Click Upload Action */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                          <div className="text-right">
                            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 tabular-nums">
                              {item.score}%
                            </span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {item.levelLabel.split(':')[0]}
                            </span>
                          </div>

                          {/* 1-Click "Upload Evidence Now" Button */}
                          <button
                            onClick={() => handleOpenModule(item.folderId)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95"
                            title="Open this module's workspace directly to upload missing evidence"
                          >
                            <Upload className="w-3.5 h-3.5 text-amber-300" />
                            <span>Upload Evidence Now</span>
                            <ArrowRight className="w-3 h-3 text-amber-300" />
                          </button>
                        </div>
                      </div>

                      {/* Missing Sample Evidences Checklist (From Official Cognia Cards) */}
                      {item.missingEvidences.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1.5">
                            Cognia Required Evidence Artifacts (Missing):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.missingEvidences.map((ev, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-rose-50 text-rose-900 border border-rose-200 font-medium"
                              >
                                <span className="text-rose-500 font-bold">✗</span>
                                <span>{ev}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matched Evidences */}
                      {item.matchedEvidences.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1.5">
                            {item.matchedEvidences.map((ev, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200"
                              >
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>{ev}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Bottom Panel Status Summary */}
            <div className="p-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="font-semibold text-slate-800">{evaluation.summaryTextEn}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onViewCogniaPdf}
                  className="text-xs text-emerald-800 hover:text-emerald-900 hover:underline font-bold flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{masterDoc ? 'Open Master Standards Document' : 'Open Official Standards PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
