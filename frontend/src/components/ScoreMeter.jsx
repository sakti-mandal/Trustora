import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Activity
} from 'lucide-react';

export default function ScoreMeter({ scoreData, currentRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasScore = scoreData?.has_score && scoreData?.overall_score !== null;
  const score = hasScore ? scoreData.overall_score : null;

  // Determine colors based on score
  const getColorScheme = (val) => {
    if (val === null || val === undefined) {
      return {
        ring: '#94a3b8',
        text: 'text-slate-600 dark:text-slate-400',
        bg: 'bg-slate-50 dark:bg-slate-800/80',
        border: 'border-slate-200 dark:border-slate-700',
        badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600',
        progressBg: 'bg-slate-400 dark:bg-slate-600',
        dot: 'bg-slate-400'
      };
    }
    if (val >= 90) {
      return {
        ring: '#10b981',
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40',
        border: 'border-emerald-200 dark:border-emerald-800/80',
        badge: 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
        progressBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
        dot: 'bg-emerald-500'
      };
    } else if (val >= 75) {
      return {
        ring: '#6366f1',
        text: 'text-indigo-700 dark:text-indigo-400',
        bg: 'bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40',
        border: 'border-indigo-200 dark:border-indigo-800/80',
        badge: 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700',
        progressBg: 'bg-gradient-to-r from-indigo-500 to-blue-500',
        dot: 'bg-indigo-500'
      };
    } else if (val >= 50) {
      return {
        ring: '#f59e0b',
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100/60 dark:hover:bg-amber-900/40',
        border: 'border-amber-200 dark:border-amber-800/80',
        badge: 'bg-amber-50 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
        progressBg: 'bg-gradient-to-r from-amber-500 to-yellow-400',
        dot: 'bg-amber-500'
      };
    } else {
      return {
        ring: '#f43f5e',
        text: 'text-rose-700 dark:text-rose-400',
        bg: 'bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100/60 dark:hover:bg-rose-900/40',
        border: 'border-rose-200 dark:border-rose-800/80',
        badge: 'bg-rose-50 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700',
        progressBg: 'bg-gradient-to-r from-rose-500 to-pink-500',
        dot: 'bg-rose-500'
      };
    }
  };

  const scheme = getColorScheme(score);

  // SVG Circular progress math
  const radius = 15;
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
    <div className="relative" ref={popoverRef}>
      {/* Sleek Interactive Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all duration-200 shadow-2xs hover:shadow active:scale-98 cursor-pointer ${scheme.bg} ${scheme.border}`}
        title="Click to view detailed Brand Compliance Score breakdown"
      >
        {/* SVG Circular Ring Gauge */}
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r={radius}
              className="text-slate-200 dark:text-slate-800 stroke-current"
              strokeWidth="3.2"
              fill="transparent"
            />
            {hasScore && (
              <circle
                cx="18"
                cy="18"
                r={radius}
                stroke={scheme.ring}
                strokeWidth="3.2"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            )}
          </svg>
          <span className={`absolute text-[10px] font-black tracking-tight ${scheme.text}`}>
            {hasScore ? score : '—'}
          </span>
        </div>

        {/* Text Labels */}
        <div className="text-left flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight whitespace-nowrap">
              {hasScore ? `${score}/100` : 'Not Analysed'}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden xs:block">
            {currentRole === 'Admin' ? 'Avg Compliance' : 'Brand Compliance'}
          </span>
        </div>
      </button>

      {/* Popover Breakdown Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-80 sm:w-92 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Brand Compliance Meter</h3>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
                {currentRole === 'Admin'
                  ? 'Company Average (All Audited Content)'
                  : currentRole === 'Reviewer'
                  ? 'Active Review Submission Score'
                  : 'Selected Content Submission Score'}
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${scheme.badge}`}>
              {hasScore ? `${score}/100` : 'Not Analysed'}
            </span>
          </div>

          {/* Overall Score Highlight */}
          {hasScore ? (
            <div className="mt-3.5 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate max-w-[170px]">
                    {scoreData?.submission_title || 'Current Target'}
                  </span>
                  <span className={`text-2xl font-black ${scheme.text}`}>
                    {score} <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ 100</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 block">Status:</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {score >= 90
                      ? 'Fully Compliant'
                      : score >= 75
                      ? 'Minor Revisions'
                      : score >= 50
                      ? 'Needs Attention'
                      : 'Critical Violations'}
                  </span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Category Score Breakdown
                </span>

                {categories.map((cat) => {
                  const catScore = scoreData?.category_scores?.[cat.key] ?? 100;
                  const catScheme = getColorScheme(catScore);
                  return (
                    <div key={cat.key} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.label}</span>
                        <span className={`font-bold font-mono ${catScheme.text}`}>{catScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${catScheme.progressBg}`}
                          style={{ width: `${catScore}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timestamp Footer */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Last Audited:</span>
                </span>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {scoreData?.last_analyzed
                    ? new Date(scoreData.last_analyzed).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Just now'}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1.5">
              <AlertCircle className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No Content Analysed Yet</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {currentRole === 'Content Creator'
                  ? 'Submit marketing copy and click "Analyse with AI" to generate the Brand Compliance score.'
                  : currentRole === 'Reviewer'
                  ? 'Select an analysed submission in the Review Queue.'
                  : 'Scores will populate as content is submitted and analysed.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
