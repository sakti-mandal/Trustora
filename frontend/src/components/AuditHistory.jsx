import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  ChevronDown,
  ArrowRight
} from 'lucide-react';

export default function AuditHistory({ submissions, onSelectSubmission, onNavigate }) {
  const [selectedSubId, setSelectedSubId] = useState('all');

  const allSubmissions = submissions || [];
  
  // Aggregate history from all submissions
  let historyEvents = [];
  allSubmissions.forEach((sub) => {
    if (sub.history) {
      sub.history.forEach((h) => {
        historyEvents.push({
          ...h,
          submission_title: sub.title,
          content_type: sub.content_type,
          current_status: sub.status
        });
      });
    }
  });

  // Sort descending by created_at / id
  historyEvents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Filter if specific submission selected
  if (selectedSubId !== 'all') {
    historyEvents = historyEvents.filter(
      (e) => e.submission_id === parseInt(selectedSubId)
    );
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'Approved':
        return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
      case 'Rejected':
        return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
      case 'Changes Requested':
        return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
      case 'Submitted for Review':
        return 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800';
      case 'Analyzed':
        return 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800';
      default:
        return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">
            Governance Audit & Decision History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Immutable database records tracking content submission, analysis runs, reviewer change requests, and approval decisions.
          </p>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
            Filter by Submission:
          </label>
          <select
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Submissions ({allSubmissions.length})</option>
            {allSubmissions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <h2 className="text-base font-bold text-navy-900 dark:text-white mb-6 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <History className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>Audit Event Timeline ({historyEvents.length} recorded events)</span>
        </h2>

        {historyEvents.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-6">
            {historyEvents.map((evt, idx) => (
              <div key={idx} className="relative pl-6">
                {/* Dot */}
                <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-brand-600 dark:bg-brand-400 ring-4 ring-white dark:ring-slate-900" />

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getActionColor(
                          evt.action
                        )}`}
                      >
                        {evt.action}
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                        {evt.submission_title}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      {evt.action_details || `Action performed on ${evt.content_type || 'marketing copy'}`}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>User ID #{evt.performed_by || 1}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {evt.created_at
                            ? new Date(evt.created_at).toLocaleString()
                            : 'Timestamp logged'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectSubmission(evt.submission_id);
                      onNavigate('creator-dashboard');
                    }}
                    className="shrink-0 text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Submission</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
            No audit history recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
