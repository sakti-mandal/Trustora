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
  UploadCloud,
  Layers,
  FileDiff
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
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        alert(`Content approved successfully! Audit record saved to database.`);
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
        alert(`Changes requested. Submission returned to Content Creator with your instructions.`);
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
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-glow-emerald/20';
      case 'Pending Review':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 shadow-glow-amber/20';
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Human Review & Governance Gate
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
              Reviewer Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Human-in-the-loop verification gate. Inspect drafted copy, review AI findings against brand guidelines, provide revision comments, and decide publication approval.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigate && (
            <button
              onClick={() => onNavigate('guidelines-hub')}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Reference PDFs & Guidelines</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50/70 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-xs text-indigo-900 dark:text-indigo-200 font-extrabold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Human Approval Required</span>
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
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                Review Queue
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[10px] font-bold">
                <button
                  onClick={() => setFilterMode('Pending')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterMode === 'Pending'
                      ? 'bg-white dark:bg-slate-700 shadow-2xs text-indigo-700 dark:text-indigo-300 font-black'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Pending ({pendingList.length})
                </button>
                <button
                  onClick={() => setFilterMode('All')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    filterMode === 'All'
                      ? 'bg-white dark:bg-slate-700 shadow-2xs text-indigo-700 dark:text-indigo-300 font-black'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  All ({allSubmissions.length})
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {displayList.length > 0 ? (
                displayList.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => onSelectSubmission(sub.id)}
                      className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all duration-200 flex flex-col gap-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-glow-sm'
                          : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                          {sub.title}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadge(
                            sub.status
                          )}`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        <span>{sub.content_type}</span>
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {sub.findings?.length || 0} AI findings
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No submissions in this filter queue.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Submission Inspection & Decision Bar (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSub ? (
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 sm:p-7 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      {selectedSub.title}
                    </h2>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        selectedSub.status
                      )}`}
                    >
                      {selectedSub.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Channel: <strong>{selectedSub.content_type}</strong> | Submitted by Creator #{selectedSub.submitted_by}
                  </p>
                </div>

                <div className="text-right text-xs text-slate-400 dark:text-slate-500 font-mono">
                  <span>Updated: {new Date(selectedSub.updated_at || selectedSub.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Side-by-Side: Original vs Revised / Current Content */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block flex items-center gap-1.5">
                  <FileDiff className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Copy Inspection & Revision Comparison</span>
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Content */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Original Draft Submission
                    </span>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 leading-relaxed min-h-[150px] whitespace-pre-wrap">
                      {selectedSub.original_content || 'No original draft content.'}
                    </div>
                  </div>

                  {/* Revised / Current Content */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Revised / Active Version for Decision
                    </span>
                    <div className="p-4 bg-indigo-50/40 dark:bg-slate-950 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed min-h-[150px] whitespace-pre-wrap shadow-2xs">
                      {selectedSub.revised_content || selectedSub.original_content}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Findings Summary */}
              {selectedSub.findings?.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                      AI Diagnostic Findings ({selectedSub.findings.length})
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Detected automatically against company rules
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
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Reviewer Feedback & Instructions to Content Creator</span>
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Required when requesting changes. Enter specific feedback, reasons, or guidance for the Creator..."
                  className="w-full p-4 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed text-slate-900 dark:text-white transition"
                />
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Decisions are persistently recorded in the audit trail.
                </span>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleDecision('request-changes')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-2xl text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-glow-amber/20"
                    title="Return to Creator with revision feedback"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Request Changes</span>
                  </button>

                  <button
                    onClick={() => handleDecision('reject')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700 rounded-2xl text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>Reject Content</span>
                  </button>

                  <button
                    onClick={() => handleDecision('approve')}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-extrabold transition shadow-glow-emerald hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Content</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-14 text-center text-slate-400 dark:text-slate-500 text-xs space-y-2">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50 text-indigo-400" />
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Review Queue Ready</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Select any submission from the queue on the left to start inspecting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
