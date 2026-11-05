import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { approveContent, rejectContent, requestChanges } from '../api';

export default function ReviewQueue({
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  onRefresh,
  onNavigate,
  onRoleChange
}) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterMode, setFilterMode] = useState('Pending'); // 'Pending' | 'All'

  const pendingList = submissions?.filter((s) => s.status === 'Pending Review') || [];
  const allSubmissions = submissions || [];
  const displayList = filterMode === 'Pending' ? pendingList : allSubmissions;

  const selectedSub =
    submissions?.find((s) => s.id === selectedSubmissionId) ||
    pendingList[0] ||
    allSubmissions[0];

  const handleDecision = async (actionType) => {
    if (!selectedSub) return;
    setIsSubmitting(true);
    try {
      if (actionType === 'approve') {
        await approveContent(selectedSub.id, comment);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        alert(`Content approved successfully!`);
      } else if (actionType === 'reject') {
        await rejectContent(selectedSub.id, comment);
        alert(`Content rejected.`);
      } else if (actionType === 'request-changes') {
        if (!comment.trim()) {
          alert('Please provide reviewer feedback in the comments box explaining the requested changes.');
          setIsSubmitting(false);
          return;
        }
        await requestChanges(selectedSub.id, comment);
        alert(`Changes requested. Submission returned to Content Creator with your comments.`);
      }
      setComment('');
      await onRefresh();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Needs Changes':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
              Human Governance & Review Queue
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              Reviewer Workspace
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Human-in-the-loop verification. Inspect submitted copy, evaluate AI findings, add reviewer feedback, and approve or request changes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-semibold">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Final Publishing Decision Belongs to Human</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wide">
                Review Queue
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setFilterMode('Pending')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'Pending' ? 'bg-white shadow-xs text-navy-900' : 'text-slate-500'
                  }`}
                >
                  Pending ({pendingList.length})
                </button>
                <button
                  onClick={() => setFilterMode('All')}
                  className={`px-2 py-0.5 rounded ${
                    filterMode === 'All' ? 'bg-white shadow-xs text-navy-900' : 'text-slate-500'
                  }`}
                >
                  All ({allSubmissions.length})
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {displayList.length > 0 ? (
                displayList.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onSelectSubmission(sub.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/70 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 truncate">
                          {sub.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadge(
                            sub.status
                          )}`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{sub.content_type}</span>
                        <span>{sub.findings?.length || 0} findings</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No submissions in this filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Inspection & Decision Action (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSub ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Submission Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-navy-900">
                      {selectedSub.title}
                    </h2>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        selectedSub.status
                      )}`}
                    >
                      {selectedSub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Channel: <strong>{selectedSub.content_type}</strong> | Submitted by Content Creator
                  </p>
                </div>
              </div>

              {/* Side-by-Side Content Comparison (Original vs Revised) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Copy */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Original Draft
                    </span>
                    <span className="text-[10px] text-slate-400">Initial Submission</span>
                  </div>
                  <div className="text-xs font-mono text-slate-700 bg-white p-3 rounded-lg border border-slate-200 min-h-[140px] whitespace-pre-wrap leading-relaxed">
                    {selectedSub.original_content}
                  </div>
                </div>

                {/* Revised Copy */}
                <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-brand-900 uppercase tracking-wide">
                      Revised Content (For Publishing)
                    </span>
                    <span className="text-[10px] font-bold text-brand-700 bg-white px-2 py-0.5 rounded border border-brand-200">
                      Current Version
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-800 bg-white p-3 rounded-lg border border-brand-200 min-h-[140px] whitespace-pre-wrap leading-relaxed">
                    {selectedSub.revised_content || selectedSub.original_content}
                  </div>
                </div>
              </div>

              {/* AI Findings Summary & Guideline Citations */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  AI Governance Audit Findings ({selectedSub.findings?.length || 0})
                </h3>
                {selectedSub.findings?.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedSub.findings.map((f, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{f.issue_category}</span>
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                              {f.severity}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{f.explanation}</p>
                          <p className="text-[10px] text-brand-700 font-medium">
                            Citation: {f.guideline_reference}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {f.verification_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>All brand rules satisfied. Zero guideline violations detected.</span>
                  </div>
                )}
              </div>

              {/* Review Comments Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reviewer Decision Notes / Feedback
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide feedback explaining your decision or requested changes..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Decision will be persistently logged in database audit history.
                </span>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleDecision('request-changes')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50"
                    title="Return to Creator with revision feedback"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Request Changes</span>
                  </button>

                  <button
                    onClick={() => handleDecision('reject')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reject Content</span>
                  </button>

                  <button
                    onClick={() => handleDecision('approve')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Content</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Select a submission from the queue to start reviewing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
