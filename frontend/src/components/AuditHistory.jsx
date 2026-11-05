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
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'Changes Requested':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Submitted for Review':
        return 'text-brand-700 bg-brand-50 border-brand-200';
      case 'Analyzed':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Governance Audit & Decision History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete immutable audit log of content creation, AI analysis runs, text revisions, and reviewer decisions.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Filter Submission:</label>
          <select
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
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

      {/* History Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        {historyEvents.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {historyEvents.map((event) => (
              <div key={event.id} className="relative group">
                {/* Dot */}
                <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-navy-900 border-2 border-white shadow-xs group-hover:scale-125 transition-transform" />

                <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getActionColor(
                          event.action
                        )}`}
                      >
                        {event.action}
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {event.submission_title}
                      </span>
                      <span className="text-slate-400">({event.content_type})</span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium">
                      {event.created_at
                        ? new Date(event.created_at).toLocaleString()
                        : 'Recent'}
                    </span>
                  </div>

                  <p className="text-slate-600 font-medium">
                    Performed by: <strong className="text-slate-800">{event.performed_by}</strong>
                  </p>

                  {/* Previous vs Updated Diff preview if content modified */}
                  {event.updated_content && event.previous_content && event.updated_content !== event.previous_content && (
                    <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 bg-rose-50/70 border border-rose-200 rounded-lg text-rose-900">
                        <span className="text-[9px] font-bold text-rose-700 uppercase block mb-0.5">
                          Previous Text
                        </span>
                        {event.previous_content}
                      </div>
                      <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-900">
                        <span className="text-[9px] font-bold text-emerald-700 uppercase block mb-0.5">
                          Revised Text
                        </span>
                        {event.updated_content}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No audit records found matching criteria.
          </div>
        )}
      </div>
    </div>
  );
}

