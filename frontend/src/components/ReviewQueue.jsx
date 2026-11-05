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
  ChevronRight,
  UploadCloud
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { approveContent, rejectContent, requestChanges } from '../api';
import ComplianceScoreCard from './ComplianceScoreCard';

export default function ReviewQueue({
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  onRefresh,
  onNavigate,
  onRoleChange,
  scoreData
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
      await onRefresh(selectedSub.id);
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Pending Review':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Needs Changes':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Rejected':
        return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">
              Human Governance & Review Queue
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Reviewer Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Human-in-the-loop verification. Inspect submitted copy, evaluate AI findings, add reviewer feedback, and approve or request changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('guidelines-hub')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Reference PDFs & Guidelines</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Human Decision Required</span>
          </div>
        </div>
      </div>

      {/* PROMINENT BRAND COMPLIANCE SCORE METER CARD (Reviewer) */}
      <ComplianceScoreCard
        scoreData={scoreData}
        currentRole="Reviewer"
        onRefresh={() => onRefresh(selectedSub?.id)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wide">
                Review Queue
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setFilterMode('Pending')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    filterMode === 'Pending'
                      ? 'bg-white dark:bg-slate-700 shadow-xs text-navy-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Pending ({pendingList.length})
                </button>
                <button
                  onClick={() => setFilterMode('All')}
                  className={`px-2 py-0.5 rounded transition cursor-pointer ${
                    filterMode === 'All'
                      ? 'bg-white dark:bg-slate-700 shadow-xs text-navy-900 dark:text-white font-bold'
                      : 'text-slate-500 dark:text-slate-400'
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
                          ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
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

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{sub.content_type}</span>
                        <span>{sub.findings?.length || 0} findings</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No submissions in this filter.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Submission Details & Review Action Box (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSub ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-navy-900 dark:text-white">
                      {selectedSub.title}
                    </h2>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        selectedSub.status
                      )}`}
                    >
                      {selectedSub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Content Type: <strong>{selectedSub.content_type}</strong> | Submitted by Creator #
                    {selectedSub.submitted_by}
                  </p>
                </div>

                <div className="text-right text-xs text-slate-400 dark:text-slate-500">
                  <span>Updated: {new Date(selectedSub.updated_at || selectedSub.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Side-by-Side: Original vs Revised / Current Content */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide block">
                  Copy Inspection & Comparison
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Content */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      Original Draft Submission
                    </span>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed min-h-[140px] whitespace-pre-wrap">
                      {selectedSub.original_content || 'No original draft content.'}
                    </div>
                  </div>

                  {/* Revised / Current Content */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      Revised / Active Version for Review
                    </span>
                    <div className="p-3.5 bg-brand-50/40 dark:bg-slate-950 rounded-xl border border-brand-200/80 dark:border-brand-900 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed min-h-[140px] whitespace-pre-wrap">
                      {selectedSub.revised_content || selectedSub.original_content}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Findings Summary */}
              {selectedSub.findings?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-navy-900 dark:text-white uppercase tracking-wide">
                      AI Governance Findings ({selectedSub.findings.length})
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Detected automatically against brand rules
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedSub.findings.map((f, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{f.issue_category}</span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {f.severity} Severity
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px]">{f.explanation}</p>
                        {f.suggested_correction && (
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                            Suggested Fix: {f.suggested_correction}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewer Feedback Input Box */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Reviewer Feedback & Instructions to Content Creator</span>
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Required when requesting changes. Enter specific feedback, reasons, or guidance for the Creator..."
                  className="w-full p-3.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans leading-relaxed text-slate-900 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Decision will be persistently logged in database audit history.
                </span>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleDecision('request-changes')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                    title="Return to Creator with revision feedback"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Request Changes</span>
                  </button>

                  <button
                    onClick={() => handleDecision('reject')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Reject Content</span>
                  </button>

                  <button
                    onClick={() => handleDecision('approve')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Content</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Select a submission from the queue to start reviewing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
