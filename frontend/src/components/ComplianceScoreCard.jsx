import React from 'react';
import {
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Activity,
  Layers
} from 'lucide-react';

export default function ComplianceScoreCard({
  scoreData,
  currentRole,
  onRefresh,
  isRefreshing = false,
  className = ""
}) {
  const hasScore = scoreData?.has_score && scoreData?.overall_score !== null;
  const score = hasScore ? scoreData.overall_score : null;

  // Determine color scheme
  // Green: 90-100, Blue: 75-89, Yellow: 50-74, Red: 0-49
  const getColorScheme = (val) => {
    if (val === null || val === undefined) {
      return {
        ring: '#94a3b8',
        gradientStart: '#94a3b8',
        gradientEnd: '#64748b',
        text: 'text-slate-500 dark:text-slate-400',
        bgPill: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
        progressBar: 'bg-slate-300 dark:bg-slate-700',
        label: 'Not Analysed',
        icon: HelpCircle
      };
    }
    if (val >= 90) {
      return {
        ring: '#10b981',
        gradientStart: '#10b981',
        gradientEnd: '#14b8a6',
        text: 'text-emerald-600 dark:text-emerald-400',
        bgPill: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-glow-emerald/30',
        dot: 'bg-emerald-500',
        progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
        label: 'Fully Compliant',
        icon: CheckCircle2
      };
    } else if (val >= 75) {
      return {
        ring: '#6366f1',
        gradientStart: '#6366f1',
        gradientEnd: '#3b82f6',
        text: 'text-indigo-600 dark:text-indigo-400',
        bgPill: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-glow-sm',
        dot: 'bg-indigo-500',
        progressBar: 'bg-gradient-to-r from-indigo-500 to-blue-500',
        label: 'Minor Revisions',
        icon: TrendingUp
      };
    } else if (val >= 50) {
      return {
        ring: '#f59e0b',
        gradientStart: '#f59e0b',
        gradientEnd: '#fbbf24',
        text: 'text-amber-600 dark:text-amber-400',
        bgPill: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-glow-amber/30',
        dot: 'bg-amber-500',
        progressBar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
        label: 'Needs Attention',
        icon: AlertTriangle
      };
    } else {
      return {
        ring: '#f43f5e',
        gradientStart: '#f43f5e',
        gradientEnd: '#fb7185',
        text: 'text-rose-600 dark:text-rose-400',
        bgPill: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 shadow-glow-rose/30',
        dot: 'bg-rose-500',
        progressBar: 'bg-gradient-to-r from-rose-500 to-pink-500',
        label: 'Critical Violations',
        icon: AlertCircle
      };
    }
  };

  const scheme = getColorScheme(score);
  const StatusIcon = scheme.icon;

  // SVG Circular progress gauge math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = hasScore ? circumference - (score / 100) * circumference : circumference;

  const categories = [
    { key: 'brand_tone', label: 'Brand Tone' },
    { key: 'approved_facts', label: 'Approved Facts' },
    { key: 'preferred_terms', label: 'Preferred Terms' },
    { key: 'prohibited_terms', label: 'Prohibited Terms' },
    { key: 'brand_guidelines', label: 'Brand Guidelines' }
  ];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
    >
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 h-72 rounded-full bg-gradient-to-tr from-blue-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-7">
        
        {/* Left Column: Dial & Primary Metrics */}
        <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto">
          {/* Circular Speedometer Gauge with SVG gradient */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 104 104">
              <defs>
                <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={scheme.gradientStart} />
                  <stop offset="100%" stopColor={scheme.gradientEnd} />
                </linearGradient>
              </defs>
              {/* Background Track */}
              <circle
                cx="52"
                cy="52"
                r={radius}
                className="text-slate-100 dark:text-slate-800/80 stroke-current"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Dynamic Animated Stroke */}
              {hasScore && (
                <circle
                  cx="52"
                  cy="52"
                  r={radius}
                  stroke="url(#scoreGaugeGrad)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              )}
            </svg>

            {/* Centered Score Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${scheme.text}`}>
                {hasScore ? score : '—'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                {hasScore ? '/ 100' : 'UNRATED'}
              </span>
            </div>
          </div>

          {/* Context Details & Status Pill */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${scheme.dot}`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${scheme.dot}`} />
                </span>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Brand Compliance
                </h2>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all ${scheme.bgPill}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{scheme.label}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-snug">
              {currentRole === 'Admin'
                ? `Company-wide compliance index calculated across all saved campaign records.`
                : currentRole === 'Reviewer'
                ? `Review Target: ${scoreData?.submission_title || 'Active Submission'}`
                : `Draft Target: ${scoreData?.submission_title || 'Current Draft Copy'}`}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 dark:text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Last Audited:{' '}
                  <strong className="text-slate-600 dark:text-slate-300 font-semibold">
                    {scoreData?.last_analyzed
                      ? new Date(scoreData.last_analyzed).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Not yet audited'}
                  </strong>
                </span>
              </span>

              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold cursor-pointer active:scale-95 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Audit</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Category Breakdown Meters */}
        <div className="w-full lg:w-7/12 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800/80 pt-5 lg:pt-0 lg:pl-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              <span>Category Compliance Breakdown</span>
            </span>
            <span>Score %</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {categories.map((cat) => {
              const catScore = hasScore ? (scoreData?.category_scores?.[cat.key] ?? 100) : 0;
              const catScheme = getColorScheme(hasScore ? catScore : null);
              return (
                <div key={cat.key} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.label}
                    </span>
                    <span className={`font-bold font-mono ${hasScore ? catScheme.text : 'text-slate-400'}`}>
                      {hasScore ? `${catScore}%` : '—'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        hasScore ? catScheme.progressBar : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{ width: `${hasScore ? catScore : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
