import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  Info,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle
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
  // Green: 90-100, Blue: 75-89, Yellow: 50-74, Red: 0-49
  const getColorScheme = (val) => {
    if (val === null || val === undefined) {
      return {
        ring: '#94a3b8',
        text: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        progressBg: 'bg-slate-300'
      };
    }
    if (val >= 90) {
      return {
        ring: '#10b981', // emerald-500
        text: 'text-emerald-700',
        bg: 'bg-emerald-50/70',
        border: 'border-emerald-200',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        progressBg: 'bg-emerald-500'
      };
    } else if (val >= 75) {
      return {
        ring: '#2563eb', // blue-600
        text: 'text-blue-700',
        bg: 'bg-blue-50/70',
        border: 'border-blue-200',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        progressBg: 'bg-blue-600'
      };
    } else if (val >= 50) {
      return {
        ring: '#f59e0b', // amber-500
        text: 'text-amber-700',
        bg: 'bg-amber-50/70',
        border: 'border-amber-200',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        progressBg: 'bg-amber-500'
      };
    } else {
      return {
        ring: '#ef4444', // rose-500
        text: 'text-rose-700',
        bg: 'bg-rose-50/70',
        border: 'border-rose-200',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        progressBg: 'bg-rose-500'
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
      {/* Compact Interactive Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border transition-all shadow-2xs hover:shadow-xs active:scale-98 ${scheme.bg} ${scheme.border}`}
        title="Click to view detailed Brand Compliance Score breakdown"
      >
        {/* SVG Circular Ring */}
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r={radius}
              className="text-slate-200 stroke-current"
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
          <span className={`absolute text-[10px] font-extrabold ${scheme.text}`}>
            {hasScore ? score : '—'}
          </span>
        </div>

        {/* Text Labels (responsive: hide text on very small mobile) */}
        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-800 tracking-tight whitespace-nowrap">
              {hasScore ? `${score}/100` : 'Not Analysed'}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">
            Brand Compliance
          </p>
        </div>
      </button>

      {/* Popover Breakdown Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-92 bg-white rounded-2xl shadow-xl border border-slate-200 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-navy-900">Brand Compliance Score</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {currentRole === 'Admin'
                  ? 'Company Average Score (All Submissions)'
                  : currentRole === 'Reviewer'
                  ? 'Active Review Submission Score'
                  : 'Selected Content Submission Score'}
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scheme.badge}`}>
              {hasScore ? `${score}/100` : 'Not Analysed'}
            </span>
          </div>

          {/* Overall Score Highlight */}
          {hasScore ? (
            <div className="mt-3.5 space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {scoreData?.submission_title || 'Current Submission'}
                  </span>
                  <span className={`text-xl font-black ${scheme.text}`}>
                    {score} <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-slate-400 block">Status:</span>
                  <span className="text-xs font-bold text-slate-800">
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Category Score Breakdown
                </span>

                {categories.map((cat) => {
                  const catScore = scoreData?.category_scores?.[cat.key] ?? 100;
                  const catScheme = getColorScheme(catScore);
                  return (
                    <div key={cat.key} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">{cat.label}</span>
                        <span className={`font-bold ${catScheme.text}`}>{catScore}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Last Audited:</span>
                </span>
                <span className="font-medium text-slate-600">
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
            <div className="py-6 text-center text-xs text-slate-400 space-y-1.5">
              <AlertCircle className="w-7 h-7 mx-auto text-slate-300 mb-1" />
              <p className="font-semibold text-slate-700">No Content Analysed Yet</p>
              <p className="text-[11px] text-slate-400">
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
