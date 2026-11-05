import React from 'react';
import {
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  TrendingUp,
  FileCheck2
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
        text: 'text-slate-500 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-800/60',
        border: 'border-slate-200 dark:border-slate-700',
        badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600',
        progressBg: 'bg-slate-400 dark:bg-slate-600',
        label: 'Not Analysed',
        icon: HelpCircle
      };
    }
    if (val >= 90) {
      return {
        ring: '#10b981',
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        badge: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
        progressBg: 'bg-emerald-500',
        label: 'Fully Compliant',
        icon: CheckCircle2
      };
    } else if (val >= 75) {
      return {
        ring: '#2563eb',
        text: 'text-blue-700 dark:text-blue-400',
        bg: 'bg-blue-50/70 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800/60',
        badge: 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
        progressBg: 'bg-blue-600',
        label: 'Minor Revisions',
        icon: TrendingUp
      };
    } else if (val >= 50) {
      return {
        ring: '#f59e0b',
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50/70 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-800/60',
        badge: 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
        progressBg: 'bg-amber-500',
        label: 'Needs Attention',
        icon: AlertTriangle
      };
    } else {
      return {
        ring: '#ef4444',
        text: 'text-rose-700 dark:text-rose-400',
        bg: 'bg-rose-50/70 dark:bg-rose-950/30',
        border: 'border-rose-200 dark:border-rose-800/60',
        badge: 'bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700',
        progressBg: 'bg-rose-500',
        label: 'Critical Violations',
        icon: AlertCircle
      };
    }
  };

  const scheme = getColorScheme(score);
  const StatusIcon = scheme.icon;

  // SVG Circular progress math
  const radius = 38;
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
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm transition-all ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Prominent Circular Dial & Primary Metrics */}
        <div className="flex items-center gap-5 sm:gap-6 shrink-0 w-full sm:w-auto">
          {/* Circular Meter Gauge */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              {/* Background track */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="text-slate-100 dark:text-slate-800 stroke-current"
                strokeWidth="7"
                fill="transparent"
              />
              {/* Dynamic progress ring */}
              {hasScore && (
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke={scheme.ring}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${scheme.text}`}>
                {hasScore ? score : '—'}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                {hasScore ? '/ 100' : 'UNRATED'}
              </span>
            </div>
          </div>

          {/* Heading, Role Context & Status Badge */}
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-navy-900 dark:text-white tracking-tight">
                Brand Compliance Score
              </h2>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${scheme.badge}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{scheme.label}</span>
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {currentRole === 'Admin'
                ? `Company Average across audited submissions`
                : currentRole === 'Reviewer'
                ? `Active Review Target: ${scoreData?.submission_title || 'Pending Submission'}`
                : `Target Submission: ${scoreData?.submission_title || 'Current Draft'}`}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Last Audited:{' '}
                  {scoreData?.last_analyzed
                    ? new Date(scoreData.last_analyzed).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Not yet audited'}
                </span>
              </span>

              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:underline font-semibold cursor-pointer active:scale-95 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Score</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Detailed Category Score Progress Bars */}
        <div className="w-full lg:w-7/12 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Category Breakdown</span>
            <span>Compliance %</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {categories.map((cat) => {
              const catScore = hasScore ? (scoreData?.category_scores?.[cat.key] ?? 100) : 0;
              const catScheme = getColorScheme(hasScore ? catScore : null);
              return (
                <div key={cat.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      {cat.label}
                    </span>
                    <span className={`font-bold text-[11px] ${hasScore ? catScheme.text : 'text-slate-400'}`}>
                      {hasScore ? `${catScore}%` : '—'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        hasScore ? catScheme.progressBg : 'bg-slate-300 dark:bg-slate-700'
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
