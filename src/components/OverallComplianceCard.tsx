import React from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Activity, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Upload, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { CogniaFolder } from '../types';
import { formatBytes } from '../services/exportService';

interface OverallComplianceCardProps {
  folders: CogniaFolder[];
  onOpenCogniaEvaluation: () => void;
  onViewCogniaPdf: () => void;
  customMasterStandardsName?: string | null;
}

export const OverallComplianceCard: React.FC<OverallComplianceCardProps> = ({
  folders,
  onOpenCogniaEvaluation,
  onViewCogniaPdf,
  customMasterStandardsName,
}) => {
  const totalModules = folders.length || 35;
  const populatedFolders = folders.filter((f) => f.fileCount > 0);
  const totalFiles = folders.reduce((sum, f) => sum + f.fileCount, 0);
  const totalSize = folders.reduce((sum, f) => sum + f.totalSize, 0);

  // Cumulative percentage of modules with at least 1 verified piece of evidence
  const coveragePercent = totalModules > 0 ? Math.round((populatedFolders.length / totalModules) * 100) : 0;

  // Domain breakdown
  const domainStats = [
    { name: 'Culture of Learning', domain: 'Learning Capacity', total: 6 },
    { name: 'Leadership for Learning', domain: 'Leadership Capacity', total: 11 },
    { name: 'Engagement & Growth', domain: 'Resource Capacity', total: 14 },
    { name: 'Accreditation Exhibits', domain: 'Accreditation Exhibits', total: 4 },
  ].map((d) => {
    const matching = folders.filter((f) => f.domain === d.domain);
    const pop = matching.filter((f) => f.fileCount > 0).length;
    const count = matching.length || d.total;
    const pct = count > 0 ? Math.round((pop / count) * 100) : 0;
    return {
      ...d,
      count,
      populated: pop,
      percent: pct,
    };
  });

  // SVG Progress Ring calculations
  const size = 156;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (coveragePercent / 100) * circumference;

  // Color determination based on progress percentage
  const ringGradientId = 'complianceRingGrad';
  let statusText = 'Initial Assembly Phase';
  let statusColorClass = 'text-amber-800 bg-amber-50 border-amber-200';
  let badgeText = 'Needs More Artifacts';

  if (coveragePercent >= 85) {
    statusText = 'Accreditation Ready (Exemplary)';
    statusColorClass = 'text-emerald-800 bg-emerald-50 border-emerald-300';
    badgeText = 'Fully Compliant';
  } else if (coveragePercent >= 60) {
    statusText = 'Operational Progress';
    statusColorClass = 'text-teal-800 bg-teal-50 border-teal-200';
    badgeText = 'Operational';
  } else if (coveragePercent >= 30) {
    statusText = 'Emerging Compliance';
    statusColorClass = 'text-amber-800 bg-amber-50 border-amber-200';
    badgeText = 'Work In Progress';
  } else {
    statusText = 'Insufficient Evidence';
    statusColorClass = 'text-rose-800 bg-rose-50 border-rose-200';
    badgeText = 'Priority Work Required';
  }

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 relative overflow-hidden transition-all">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-50/60 via-amber-50/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left Section: Circular Progress Ring & Core Status */}
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
          
          {/* Progress Ring */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              className="transform -rotate-90 overflow-visible"
            >
              <defs>
                <linearGradient id={ringGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />     {/* Gold */}
                  <stop offset="50%" stopColor="#10B981" />    {/* Emerald */}
                  <stop offset="100%" stopColor="#047857" />   {/* Deep Forest */}
                </linearGradient>
                <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#047857" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Background Track Circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth={strokeWidth}
              />

              {/* Animated Progress Arc */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#${ringGradientId})`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
                filter="url(#ringGlow)"
              />
            </svg>

            {/* Inner Ring Labels */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
                {coveragePercent}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono -mt-1">
                COMPLIANCE
              </span>
            </div>
          </div>

          {/* Title & Key Compliance Metrics */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider font-mono bg-emerald-100 text-emerald-800 border-emerald-300">
                Live Audit
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusColorClass}`}>
                {badgeText}
              </span>
              {customMasterStandardsName ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  Custom Standards PDF Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Cognia K–12 Standards Active
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Overall Compliance Progress
            </h3>

            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              Real-time audit tracking verified evidence across all <strong className="text-slate-900">{totalModules} Cognia Standards and Institutional Exhibits</strong>. Evaluated 100% offline via local IndexedDB.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-600 font-mono">
              <div>
                <span className="text-slate-400">Populated: </span>
                <strong className="text-emerald-700 font-bold">{populatedFolders.length}</strong> / {totalModules} Modules
              </div>
              <div>
                <span className="text-slate-400">Files: </span>
                <strong className="text-slate-800 font-bold">{totalFiles}</strong> Artifacts
              </div>
              <div>
                <span className="text-slate-400">Storage: </span>
                <strong className="text-slate-800 font-bold">{formatBytes(totalSize)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Mini Domain Breakdown & Quick Action Buttons */}
        <div className="flex-1 lg:max-w-md xl:max-w-lg bg-slate-50/80 rounded-xl border border-slate-200/80 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200/60">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
              <span>Standard Capacities Breakdown</span>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">Real-Time Progress</span>
          </div>

          <div className="space-y-2">
            {domainStats.map((ds) => (
              <div key={ds.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate">{ds.name}</span>
                  <span className="font-mono text-[11px] text-slate-600 font-semibold">
                    {ds.populated}/{ds.count} ({ds.percent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${ds.percent}%`,
                      backgroundColor: ds.percent >= 80 ? '#059669' : ds.percent >= 50 ? '#10B981' : ds.percent >= 25 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
            {/* Open Cognia Evaluation Gauge Modal */}
            <button
              type="button"
              onClick={onOpenCogniaEvaluation}
              className="flex-1 min-w-[170px] flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Launch Live Audit Gauge</span>
            </button>

            {/* View Master Standards PDF */}
            <button
              type="button"
              onClick={onViewCogniaPdf}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors shadow-2xs"
              title="Open Official Standards Resource Cards PDF"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Master PDF</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
